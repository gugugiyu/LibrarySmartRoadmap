import { parentPort, workerData } from 'worker_threads';
import { CrawlerService } from 'src/modules/crawler/crawler.service';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';

(async () => {
    try {
        const query = workerData.query;
        const configService = new ConfigService();
        //const crawlerService = new CrawlerService();

        const username = configService.get<string>('OPENATHENS_USER');
        const password = configService.get<string>('OPENATHENS_PASS');

        if (!username || !password) {
            throw new HttpException('Unable to find library account', 500);
        }

        // await crawlerService.initRedirect();
        // await crawlerService.login(username, password);
        // const status = await crawlerService.search(query || process.env.DEFAULT_TOPIC);

        // if (status) {
        //   await crawlerService.searchMore();
        // }

        //await crawlerService.close();

        parentPort?.postMessage({ success: true, query });
    } catch (err) {
        parentPort?.postMessage({ success: false, error: err.message });
    }
})();
