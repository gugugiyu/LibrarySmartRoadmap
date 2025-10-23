import { Module } from "@nestjs/common"
import { ResourcesService } from "./resources.service"
import { ResourcesController } from "./resources.controller"

@Module({
    providers: [ResourcesService],
    controllers: [ResourcesController],
    exports: [ResourcesService],
})

export class ResourcesModule {}