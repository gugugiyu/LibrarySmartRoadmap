import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { RoadmapsService } from './roadmaps.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('roadmaps')
export class RoadmapsController {
    constructor(private readonly svc: RoadmapsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('generate')
    async generate(@Req() req: any, @Body() body: any) {
        const userId = req.user?.sub || 'anon'
        return this.svc.generate({
            subject: body?.subject || 'chưa đặt chủ đề',
            background: body?.background || '',
            level: body?.level || '',
            readItems: body?.readItems || [],
            pace: body?.pace || '',
        }, userId)
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.svc.get(id)
    }
}