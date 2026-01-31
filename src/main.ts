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
        app.useLogger(logger);

        // Security Middlewares
        app.use(helmet());
        app.enableCors({
            origin: configService.get('ALLOWED_ORIGINS')?.split(',') || '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        // Rate Limiting
        const windowMs = configService.get<number>('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000;
        const limit = configService.get<number>('RATE_LIMIT_MAX') || 100;
        app.use(rateLimitConfig(windowMs, limit));

        // Utility Middlewares
        app.use(compression());
        app.use(cookieParser());
        app.use(morgan('dev'));

        // Session Configuration
        app.use(
            session({
                secret: configService.get('SESSION_SECRET') || 'secret',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: configService.get('NODE_ENV') === 'production',
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

        const port = configService.get('PORT') || 3000;

        await app.listen(port);

        logger.log(`Application is running on: ${await app.getUrl()}`);
    } catch (error) {
        console.error('Failed to bootstrap the application', error);
        process.exit(1);
    }
}
bootstrap();

