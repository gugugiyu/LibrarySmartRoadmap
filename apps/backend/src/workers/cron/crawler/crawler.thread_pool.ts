import { StaticPool } from 'node-worker-threads-pool';
import path from 'path';

const staticCrawlPool = new StaticPool({
    size: 4, // number of concurrent workers
    task: path.resolve(__dirname, './crawl.worker.js'),
});

export default staticCrawlPool;
