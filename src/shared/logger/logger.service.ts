import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        const logFormat = winston.format.printf(
            ({ level, message, timestamp, stack }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
            },
        );

        const createLevelTransport = (level: string) => {
            return new winston.transports.DailyRotateFile({
                filename: `logs/%DATE%/${level}.log`,
                datePattern: 'YYYY-MM-DD',
                level: level,
                maxFiles: '30d',
                format: winston.format.combine(
                    winston.format((info) => {
                        return info.level === level ? info : false;
                    })(),
                    winston.format.timestamp(),
                    logFormat,
                ),
            });
        };

        this.logger = winston.createLogger({
            level: 'silly', // Set base level to lowest to allow all logs through to transports
            format: winston.format.combine(winston.format.timestamp(), logFormat),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.timestamp(),
                        logFormat,
                    ),
                }),
                createLevelTransport('error'),
                createLevelTransport('warn'),
                createLevelTransport('info'),
                createLevelTransport('http'),
                createLevelTransport('debug'),
                createLevelTransport('verbose'),
                createLevelTransport('silly'),
            ],
        });
    }

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace?: string) {
        this.logger.error(message, { stack: trace });
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}

