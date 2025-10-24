import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { SearchService } from './search.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('search')
export class SearchController {
    constructor(private readonly search: SearchService) {}

    @UseGuards(AuthGuard('jwt'))
    
    @Get()
    async searchHybrid(@Req() req: any, @Query('q') q?: string, @Query() filters?: any) {
        const userId = req.user?.sub || null
        const hits = await this.search.hybridSearch(userId, q || '', filters || {}, 10)
        return hits
    }
}