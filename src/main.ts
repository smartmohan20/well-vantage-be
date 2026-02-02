import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './shared/logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { rateLimitConfig } from './core/config/rate-limit.config';

/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule, {
            bufferLogs: true,
        });

        const configService = app.get(ConfigService);
        const logger = app.get(AppLogger);

        // Extract configuration values
        const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || '*';
        const rateLimitWindow = configService.get<number>('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000;
        const rateLimitMax = configService.get<number>('RATE_LIMIT_MAX') || 100;
        const sessionSecret = configService.get<string>('SESSION_SECRET') || 'secret';
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const port = configService.get<number>('PORT') || 3000;

        app.useLogger(logger);

        // Security Middlewares
        app.use(helmet());
        app.enableCors({
            origin: allowedOrigins,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        // Rate Limiting
        app.use(rateLimitConfig(rateLimitWindow, rateLimitMax));

        // Utility Middlewares
        app.use(compression());
        app.use(cookieParser());

        // Morgan Logger Setup
        app.use(morgan('dev')); // Console logging
        app.use(morgan('combined', { stream: logger.getMorganStream() })); // File logging
        app.use(
            session({
                secret: sessionSecret,
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: isProduction,
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                },
            }),
        );

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

        await app.listen(port);

        logger.log(`Application is running on: ${await app.getUrl()}`);
    } catch (error) {
        console.error('Failed to bootstrap the application', error);
        process.exit(1);
    }
}
bootstrap();

