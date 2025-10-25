import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: parseInt(configService.get('DB_PORT') || '5432', 10),
    username: configService.get('DB_USER') || 'postgres',
    password: '1234',
    database: configService.get('DB_DATABASE') || 'smartroadmap',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/infra/db/migrations/*.ts'],
});
