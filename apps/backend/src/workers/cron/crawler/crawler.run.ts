import staticCrawlPool from './crawler.thread_pool';

async function runCrawlers() {
    const queries = ['physics', 'machine learning', 'chemistry', 'data science', 'biology'];

    const promises = queries.map((query) =>
        staticCrawlPool
            .exec({ query })
            .then((result) => {
                console.log(`Completed: ${query}`, result);
            })
            .catch((err) => {
                console.error(`Failed: ${query}`, err);
            }),
    );

    await Promise.all(promises);

    console.log('All queries processed!');
}

runCrawlers();
