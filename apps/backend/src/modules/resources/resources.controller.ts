import { Controller, Get, Query } from '@nestjs/common'
import { ResourcesService } from './resources.service'

@Controller('resources')
export class ResourcesController {
    constructor(private readonly resources: ResourcesService) {}

    @Get()
    list(@Query('q') q?:string, @Query() filters?:any) {
        return this.resources.searchSimple(q || '', filters || {})
    }

    @Get('all')
    all() {
        return this.resources.listAll()
    }
}