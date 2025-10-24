import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get<string>('DB_HOST') || 'localhost',
                port: parseInt(cfg.get<string>('DB_PORT') || '5432', 10),
                username: cfg.get<string>('DB_USER') || 'postgres',
                password: cfg.get<string>('DB_PASS') || '',
                database: cfg.get<string>('DB_DATABASE') || 'smartroadmap',
                autoLoadEntities: true,
                synchronize: true, // Dev
                logging: true, // Dev
            }),
        }),
    ],
})
export class DbModule {}
