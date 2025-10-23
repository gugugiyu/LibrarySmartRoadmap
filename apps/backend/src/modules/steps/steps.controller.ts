import { Controller, Get, Param, Query } from '@nestjs/common'
import { StepsService } from './steps.service'

@Controller()
export class StepsController {
    constructor(private readonly steps: StepsService) {}

    @Get('roadmaps/:id/steps')
    list(@Param('id') roadmapId: string) {
        return this.steps.listByRoadmap(roadmapId)
    }

    @Get('steps/:id/recommendations')
    recs(@Param('id') stepId: string, @Query('top_k') topK?: string) {
        const k = Math.max(parseInt(topK || '10', 10) || 10, 1)
        return this.steps.getRecommendations(stepId, k)
    }
}