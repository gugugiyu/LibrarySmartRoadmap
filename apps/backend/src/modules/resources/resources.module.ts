import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { TextualInformation } from '../../models/textual_information.entity';
import { Book } from '../../models/book.entity';
import { Article } from '../../models/article.entity';
@Module({
    imports: [TypeOrmModule.forFeature([TextualInformation, Book, Article])],
    providers: [ResourcesService],
    controllers: [ResourcesController],
    exports: [ResourcesService],
})
export class ResourcesModule {}
