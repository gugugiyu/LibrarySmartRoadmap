import { Controller, Get, HttpException, Query, Logger } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { ConfigService } from '@nestjs/config';

@Controller('crawler')
export class CrawlerController {
    private readonly logger = new Logger(CrawlerController.name);

    constructor(
        private readonly crawlerService: CrawlerService,
        private configService: ConfigService,
    ) {}

    /**
     * Runs the entire crawl process.
     * 1. Fetches credentials
     * 2. Initializes the browser and navigates to the login redirect.
     * 3. Logs in.
     * 4. Performs the search.
     * 5. Scrapes the results.
     * 6. Cleans up and closes the browser.
     *
     * @param query The search term to query (e.g., "Business").
     * @param limit The maximum number of results to scrape.
     */
    @Get('run')
    async run(@Query('q') query: string, @Query('limit') limit: number) {
        const username = this.configService.get<string>('OPENATHENS_USER');
        const password = this.configService.get<string>('OPENATHENS_PASS');

        if (!username || !password) {
            this.logger.error('OPENATHENS_USER or OPENATHENS_PASS not set in .env');
            throw new HttpException('Unable to find library account credentials', 500);
        }

        try {
            await this.crawlerService.initRedirect();
            await this.crawlerService.login(username, password);

            // Use the provided query or a default topic from environment variables
            const searchQuery = query || process.env.DEFAULT_TOPIC;
            if (!searchQuery) {
                throw new HttpException('No search query provided and no DEFAULT_TOPIC set', 400);
            }

            await this.crawlerService.search(searchQuery);

            // Pass the limit to searchMore. The service will handle if it's undefined.
            await this.crawlerService.searchMore(limit);

            return {
                message: 'Crawl completed successfully.',
                query: searchQuery,
                limit: limit ? +limit : 'all',
            };
        } catch (error) {
            this.logger.error(`Crawl failed: ${error.message}`, error.stack);
            // Re-throw the exception so NestJS handles the response
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`An unexpected error occurred: ${error.message}`, 500);
        } finally {
            // CRITICAL: Always close the browser to prevent memory leaks
            // whether the process succeeded or failed.
            await this.crawlerService.close();
        }
    }
}
