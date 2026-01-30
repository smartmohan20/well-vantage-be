import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './shared/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule, {
            bufferLogs: true,
        });

        const logger = app.get(AppLogger);
        app.useLogger(logger);

        // Handle unhandled rejections and uncaught exceptions at the process level
        process.on('unhandledRejection', (reason, promise) => {
            logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });

        process.on('uncaughtException', (error) => {
            logger.error(`Uncaught Exception: ${error.message}`, error.stack);
            // In production, you might want to restart the process here after logging
        });

        // Set up global validation pipe
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

        const configService = app.get(ConfigService);
        const port = configService.get('PORT') || 3000;

        await app.listen(port);
        logger.log(`Application is running on: ${await app.getUrl()}`);
    } catch (error) {
        console.error('Failed to bootstrap the application', error);
        process.exit(1);
    }
}
bootstrap();

