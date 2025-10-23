import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = app.get(ConfigService);
    const origin = config.get<string>('CORS_ORIGIN') || '*';

    app.enableCors({
        origin: origin === '*' ? true : origin.split(',').map(s => s.trim()),
        credentials: true,
    });

    const port = config.get<number>('PORT') || 4000;
    await app.listen(port);
    console.log(`Backend is running at: http://localhost:${port} . Gúd Gúd`);
}

bootstrap();