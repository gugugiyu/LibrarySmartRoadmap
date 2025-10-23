import { Module } from '@nestjs/common'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { ResourcesModule } from '../resources/resources.module'
import { LexicalRepo } from './repositories/lexical.repository'
import { VectorRepo } from './repositories/vector.repository'
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module'

@Module({
    imports: [ResourcesModule, AiGatewayModule],
    providers: [
        SearchService,
        { provide: 'LexicalRepository', useClass: LexicalRepo },
        { provide: 'VectorRepository', useClass: VectorRepo },
        // alias để constructor type là interface vẫn inject được
        { provide: LexicalRepo, useExisting: 'LexicalRepository' },
        { provide: VectorRepo, useExisting: 'VectorRepository' },
    ],
    controllers: [SearchController],
    exports: [SearchService],
})

export class SearchModule {}