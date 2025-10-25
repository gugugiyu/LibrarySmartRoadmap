import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/models/book.entity';

@Module({
    // Import ConfigModule so ConfigService is available
    imports: [ConfigModule, TypeOrmModule.forFeature([Book])],
    controllers: [CrawlerController],
    providers: [CrawlerService],
})
export class CrawlerModule {}
