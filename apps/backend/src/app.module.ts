import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/env';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './modules/common/common.module';
import { DbModule } from './infra/db/db.module';
import { AiGatewayModule } from './modules/ai-gateway/ai-gateway.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SearchModule } from './modules/search/search.module';
import { StepsModule } from './modules/steps/steps.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { DevSeedModule } from './modules/dev-seed/dev-seed.module';
import { CrawlerModule } from './modules/crawler/crawler.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
        }),
        // add dần các module domain chỗ này
        UsersModule,
        AuthModule,
        CommonModule,
        DbModule,
        AiGatewayModule,
        ResourcesModule,
        SearchModule,
        StepsModule,
        RoadmapsModule,
        DevSeedModule,
        CrawlerModule,
    ],
})
export class AppModule {}
