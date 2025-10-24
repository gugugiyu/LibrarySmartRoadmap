import { Module } from '@nestjs/common'
import { RoadmapsService } from './roadmaps.service'
import { RoadmapsController } from './roadmaps.controller'
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module'
import { SearchModule } from '../search/search.module'
import { StepsModule } from '../steps/steps.module'

@Module({
    imports: [AiGatewayModule, SearchModule, StepsModule],
    providers: [RoadmapsService],
    controllers: [RoadmapsController],
})

export class RoadmapsModule {}