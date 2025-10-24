import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ResourcesModule } from '../resources/resources.module';
import { LexicalRepo } from './repositories/lexical.repository';
import { VectorRepo } from './repositories/vector.repository';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { TextualInformation } from '../../models/textual_information.entity';
import { Book } from '../../models/book.entity';
import { Article } from '../../models/article.entity';

@Module({
    imports: [
        ResourcesModule,
        AiGatewayModule,
        TypeOrmModule.forFeature([TextualInformation, Book, Article]),
    ],
    providers: [
        { provide: 'LexicalRepository', useClass: LexicalRepo },
        { provide: 'VectorRepository', useClass: VectorRepo },
        SearchService,
    ],
    controllers: [SearchController],
    exports: [SearchService],
})
export class SearchModule {}
