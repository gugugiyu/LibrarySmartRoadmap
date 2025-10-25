import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assert } from 'console';
import { request } from 'http';
import * as puppeteer from 'puppeteer';
import { Book } from 'src/models/book.entity';
import { Repository } from 'typeorm';
import * as fs from 'node:fs/promises';

interface OpenAthensCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    sameSite?: string;
    sameParty?: boolean;
}

@Injectable()
export class CrawlerService {
    // TODO: having error here
    //constructor(@InjectRepository(Book) private readonly bookRepo: Repository<Book>){}

    private readonly logger = new Logger(CrawlerService.name);
    private browser: puppeteer.Browser;
    private page: puppeteer.Page;
    private cookies: OpenAthensCookie[];
    private query: string;

    async initPageEventHandler() {
        await this.page.setRequestInterception(true);

        this.page.on('response', (response) => {
            const url = response.url();
            this.logger.verbose(
                `Receving: ${url.length > 100 ? url.slice(0, 60) + '...' : url} - ${response.request().resourceType()}`,
            );
        });

        const blockedResources = [
            'google-analytics.com',
            'googletagmanager.com',
            'tattle.api.osano.com',
        ];

        this.page.on('request', (request) => {
            const url = request.url();
            if (
                ['image', 'stylesheet', 'font', 'medias'].includes(request.resourceType()) ||
                blockedResources.some((domain) => url.includes(domain))
            ) {
                request.abort();
            } else {
                if (request.resourceType() == 'xhr' && request.resourceType() == 'fetch') {
                    this.logger.verbose(
                        `Fetching: ${url.length > 100 ? url.slice(0, 60) + '...' : url}`,
                    );
                }

                request.continue();
            }
        });
    }

    /**
     * STEP 1: Navigate to VNU-HCM Library redirect page and infer OpenAthens cookie.
     * This is because directly accessing the url will result in missing reference cookies
     */
    async initRedirect(): Promise<void> {
        this.logger.log('Launching Puppeteer browser...');
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        this.initPageEventHandler();

        const vnuUrl = 'https://m-auth.vnulib.edu.vn/readbook?key=eBook%20Business%20Collection';

        this.logger.log(`Navigating to: ${vnuUrl}`);
        await this.page.goto(vnuUrl, { waitUntil: 'networkidle2', timeout: 0 });

        this.logger.log('Waiting for OpenAthens login page to load...');
        // You can fine-tune this selector later once you inspect the DOM.
        await this.page.waitForSelector('form');

        const fetchedCookies = await this.browser.cookies();
        this.cookies = fetchedCookies;
        this.logger.log(
            `Initial cookies inferred: ${fetchedCookies.map((val) => val.name).join('-')}`,
        );
    }

    /**
     * STEP 2: Perform login using provided credentials.
     */
    async login(username: string, password: string): Promise<void> {
        this.logger.log('Performing login...');
        const submitButtonSelector = '#login-controls button[type="submit"]';

        // Fixes from https://github.com/puppeteer/puppeteer/issues/1648
        await this.page.evaluate((text) => {
            (
                document.querySelector('.login-input-group input:first-child') as HTMLInputElement
            ).value = text;
        }, username);
        await this.page.evaluate((text) => {
            (
                document.querySelector(
                    '.password-input-group input:first-child',
                ) as HTMLInputElement
            ).value = text;
        }, password);

        // This won't type out all characters
        // await this.page.type(usernameSelector, username, { delay: 25 });
        // await this.page.type(passwordSelector, password, { delay: 20 });

        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 }),
            this.page.click(submitButtonSelector),
        ]);

        this.logger.log('Login successful. Session established.');
    }

    /**
     * STEP 3: Perform a search query on the authenticated site.
     */
    async search(query: string): Promise<boolean> {
        this.logger.log(`Searching for query: "${query}"`);
        this.query = query;

        const searchSelector = '#search-input';
        const submitButtonSelector = 'form.search button[type="submit"]';
        await Promise.all([
            this.page.waitForSelector(searchSelector, { visible: true }),
            this.page.waitForSelector(submitButtonSelector),
        ]);

        // Cumbersome with required to trigger the search button
        await this.page.evaluate(
            (text) => {
                (document.querySelector('#search-input') as HTMLInputElement).value = text;
            },
            query.substring(0, query.length - 1),
        );
        await this.page.type(searchSelector, query.charAt(query.length - 1), { delay: 25 });

        await this.page.click(submitButtonSelector);

        return true;
    }

    /**
     * STEP 4: Scrapes search results. Clicks "load more" until all results
     * are visible, then scrapes data from each entry up to the specified limit.
     *
     * @param {number} [limit] - Optional maximum number of results to scrape.
     */
    async searchMore(limit?: number): Promise<void> {
        const loadMoreBtnSelector = 'button[data-auto="show-more-button"][aria-controls]';
        const resultsCountTextSelector = '#results-count';
        const resultListSelector = '#result-list';
        const resultItemSelector = '#result-list > section > article';

        // Selectors relative to each resultItem
        const titleSelector = 'h3';
        const abstractSelector = 'div[data-auto^="abstract"]';
        const authorListSelector =
            'dl dd[data-auto="result-item-metadata-content--contributors"] ul.delimited-list__list';
        const pubDateSelector =
            'dl dd[data-auto="result-item-metadata-content--published"] span[dir]';

        try {
            await Promise.all([
                this.page.waitForSelector(resultsCountTextSelector, { timeout: 30000 }),
                this.page.waitForSelector(resultListSelector),
                this.page.waitForSelector(resultItemSelector), // Wait for at least one result
            ]);
        } catch (error) {
            const noResults = await this.page.$('div[data-auto="no-results"]');
            if (noResults) {
                this.logger.log('Search returned no results.');
                return;
            }
            this.logger.error(`Failed to find results list: ${error.message}`);
            throw new HttpException(`Failed to find search results: ${error.message}`, 500);
        }

        const totalResult = await this.page.$eval(resultsCountTextSelector, (elem) =>
            Number.parseInt(elem.textContent.slice('Results: '.length, elem.textContent.length)),
        );
        this.logger.verbose(`Total results found: ${totalResult}`);

        if (totalResult === 0) {
            this.logger.log('Search returned 0 results.');
            return;
        }

        const isElementVisible = async (page, cssSelector) => {
            let visible = true;
            await page.waitForSelector(cssSelector, { visible: true, timeout: 2000 }).catch(() => {
                visible = false;
            });
            return visible;
        };

        // Click "Load More" until it disappears or we have enough results (if limit is set)
        let loadMoreVisible = await isElementVisible(this.page, loadMoreBtnSelector);
        while (loadMoreVisible) {
            const currentResultCount = (await this.page.$$(resultItemSelector)).length;
            if (limit && currentResultCount >= limit) {
                this.logger.log(
                    `Reached ${currentResultCount} items, stopping "load more" for limit of ${limit}.`,
                );
                break;
            }

            this.logger.verbose(
                `Clicking "Show more"... currently ${currentResultCount} results visible.`,
            );
            await this.page.click(loadMoreBtnSelector).catch(() => {});
            loadMoreVisible = await isElementVisible(this.page, loadMoreBtnSelector);
        }

        this.logger.log('All results loaded, or limit reached. Starting scrape...');
        let resultItems = await this.page.$$(resultItemSelector);

        // Edge Case: Apply the limit if it exists
        const itemsToProcess = limit && limit > 0 ? resultItems.slice(0, limit) : resultItems;
        this.logger.log(`Processing ${itemsToProcess.length} result items...`);

        const list = await Promise.all(
            itemsToProcess.map(async (item) => {
                // Use $eval to find one item, or return null if not found
                // Use $$eval to find multiple items, or return [] if not found

                const title = await item
                    .$eval(titleSelector, (el) => el.textContent.trim())
                    .catch(() => null);

                const abstract = await item
                    .$eval(abstractSelector, (el) =>
                        el.textContent.replace(/<mark>|<\/mark>/g, '').trim(),
                    )
                    .catch(() => null);

                const authors: string[] = await item
                    .$eval(authorListSelector, (ul) =>
                        Array.from(ul.querySelectorAll('li a')).map((a) => a.textContent.trim()),
                    )
                    .catch(() => []); // Default to empty array

                const publication_date = await item
                    .$eval(pubDateSelector, (el) => el.textContent.trim())
                    .catch(() => null);

                // Filter date to get just the year, if it exists
                const publication_year = publication_date
                    ? Number.parseInt(publication_date) || null
                    : 1970;

                return {
                    title: title,
                    abstract: abstract,
                    author: authors.join(';'),
                    publication_date: publication_year, // Store the parsed year
                };
            }),
        );

        // Filter out any potential empty/failed entries (though nulls are better)
        const finalList = list.filter((item) => item.title); // Only include items where we at least found a title

        this.logger.verbose(`Writing ${finalList.length} entries to list....`);
        await this.writeArrayToFile(finalList, `dataset-${this.query.replace(/\s+/g, '_')}.json`);
        //const result = await this.bookRepo.insert(finalList);
        // if (result.identifiers){
        //   this.logger.log(`Successfully writing data to db`);
        // }else {
        //   this.logger.error(`Error when trying to write to db`);
        // }
    }

    async writeArrayToFile(dataArray: any[], filename: string): Promise<void> {
        try {
            const jsonString = JSON.stringify(dataArray, null, 2); // Pretty-print JSON
            await fs.writeFile(filename, jsonString, 'utf8');
            console.log(
                `Array successfully written to ${filename} with: ${dataArray.length} entries`,
            );
        } catch (error) {
            console.error(`Error writing array to file: ${error}`);
            throw error;
        }
    }

    /**
     * Closes the Puppeteer browser instance if it's open and connected.
     */
    async close(): Promise<void> {
        this.logger.log('Closing browser...');
        if (this.browser && this.browser.isConnected()) {
            await this.browser.close();
            this.logger.log('Browser closed.');
        } else {
            this.logger.log('Browser was not running or already disconnected.');
        }
    }
}
