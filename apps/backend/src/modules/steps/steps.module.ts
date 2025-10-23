import { Module } from '@nestjs/common'
import { StepsService } from './steps.service'
import { StepsController } from './steps.controller'

@Module({
    providers: [StepsService],
    controllers: [StepsController],
    exports: [StepsService],
})

export class StepsModule {}