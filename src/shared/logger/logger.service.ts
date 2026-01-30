import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

// Increase stack trace limit for better caller detection
Error.stackTraceLimit = 25;

/**
 * Custom logger service implementing NestJS LoggerService.
 * Uses Winston for logging with daily rotation and custom formatting.
 */
@Injectable()
export class AppLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        // Custom format to add the caller file path and identify internal logs
        const stackPathFormat = winston.format((info) => {
            const stack = (info.callerStack || info.stack || new Error().stack) as string;
            if (!stack) {
                info.filePath = 'unknown';
                info.isInternal = true;
                return info;
            }

            const lines = stack.split('\n');
            let fallbackPath = '';
            let foundProjectFile = false;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('at ')) continue;

                const match = trimmed.match(/(?:at\s+)?(?:.*\s+\()?(.*?):(\d+):(\d+)\)?$/);
                if (match) {
                    const fullRawPath = match[1];
                    const lineNum = match[2];
                    const colNum = match[3];
                    const normalizedPath = fullRawPath.replace(/\\/g, '/');
                    const lowerPath = normalizedPath.toLowerCase();

                    if (lowerPath.startsWith('node:') || lowerPath.includes('internal/')) continue;
                    if (lowerPath.includes('logger.service.')) continue;

                    const isNodeModule = lowerPath.includes('node_modules');
                    try {
                        const relPath = path.relative(process.cwd(), fullRawPath);
                        const displayPath = `${relPath}:${lineNum}:${colNum}`;

                        if (!isNodeModule) {
                            info.filePath = displayPath;
                            info.isInternal = false;
                            foundProjectFile = true;
                            break;
                        }
                        if (!fallbackPath) fallbackPath = displayPath;
                    } catch {
                        // Ignore and keep searching
                    }
                }
            }

            if (!foundProjectFile) {
                info.filePath = fallbackPath || 'unknown';
                info.isInternal = true;
            }

            delete info.callerStack;
            delete info.stack;
            return info;
        });

        // JSON format for file logs
        const jsonLogFormat = winston.format.printf(({ timestamp, level, filePath, message, context, data, errors }) => {
            const jsonPart = JSON.stringify({
                message,
                context: context || '',
                data: data || {},
                errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
            });
            return `${timestamp} [${level.toUpperCase()}] [${filePath}]: ${jsonPart}`;
        });

        // Simple format for console logs: [LEVEL] YYYY-MM-DD HH:mm:ss: message
        const consoleFormat = winston.format.printf(({ timestamp, level, message, errors }) => {
            // Manually colorize the level for better visibility
            const colorizer = winston.format.colorize();
            const upperLevel = level.toUpperCase();
            const colorizedLevel = colorizer.colorize(level, `[${upperLevel}]`);

            const base = `${colorizedLevel} ${timestamp}: ${message}`;

            if (level.includes('error') && errors && Array.isArray(errors) && errors.length > 0) {
                const errorDetails = errors
                    .map((e) => (e instanceof Error ? e.stack : typeof e === 'object' ? JSON.stringify(e, null, 2) : e))
                    .join('\n');
                return `${base}\n${errorDetails}`;
            }
            return base;
        });

        // Filter for console: only errors and startup messages
        const consoleFilter = winston.format((info) => {
            if (info.level === 'error') return info;
            const msg = String(info.message);
            const startupPatterns = [
                'Application is running on',
                'Nest application successfully started',
                'Starting Nest application',
            ];
            return startupPatterns.some((pattern) => msg.includes(pattern)) ? info : false;
        });

        // Helper to create file transports
        const createFileTransport = (level: string, isInternal: boolean) => {
            return new winston.transports.DailyRotateFile({
                filename: `logs/%DATE%/${isInternal ? 'nest' : level}.log`,
                datePattern: 'YYYY-MM-DD',
                level: level,
                maxFiles: '30d',
                format: winston.format.combine(
                    winston.format((info) => (isInternal ? info.isInternal : (!info.isInternal && info.level === level)) ? info : false)(),
                    winston.format.timestamp(),
                    jsonLogFormat,
                ),
            });
        };

        this.logger = winston.createLogger({
            level: 'silly',
            format: winston.format.combine(stackPathFormat()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        consoleFilter(),
                        consoleFormat,
                    ),
                }),
                createFileTransport('error', false),
                createFileTransport('warn', false),
                createFileTransport('info', false),
                createFileTransport('http', false),
                createFileTransport('debug', false),
                createFileTransport('verbose', false),
                createFileTransport('silly', false),
                createFileTransport('silly', true), // This will create nest.log
            ],
        });
    }

    log(message: any, ...optionalParams: any[]) {
        try {
            const { data, context } = this.parseParams(optionalParams);
            const callerStack = new Error().stack;
            this.logger.info(message, { data, context, callerStack });
        } catch (error) {
            console.error('Logger failed to log:', error);
        }
    }

    error(message: any, ...optionalParams: any[]) {
        try {
            const { data, context, errors } = this.parseErrorParams(optionalParams);
            const callerStack = new Error().stack;
            this.logger.error(message, { data, context, errors, callerStack });
        } catch (error) {
            console.error('Logger failed to log error:', error);
        }
    }

    warn(message: any, ...optionalParams: any[]) {
        try {
            const { data, context } = this.parseParams(optionalParams);
            const callerStack = new Error().stack;
            this.logger.warn(message, { data, context, callerStack });
        } catch (error) {
            console.error('Logger failed to log warning:', error);
        }
    }

    debug(message: any, ...optionalParams: any[]) {
        try {
            const { data, context } = this.parseParams(optionalParams);
            const callerStack = new Error().stack;
            this.logger.debug(message, { data, context, callerStack });
        } catch (error) {
            console.error('Logger failed to log debug:', error);
        }
    }

    verbose(message: any, ...optionalParams: any[]) {
        try {
            const { data, context } = this.parseParams(optionalParams);
            const callerStack = new Error().stack;
            this.logger.verbose(message, { data, context, callerStack });
        } catch (error) {
            console.error('Logger failed to log verbose:', error);
        }
    }

    private parseParams(params: any[]) {
        try {
            let context = '';
            let data = {};
            if (params.length > 0) {
                const lastParam = params[params.length - 1];
                if (typeof lastParam === 'string' && params.length > 0) {
                    context = lastParam;
                    if (params.length > 1) data = params[0];
                } else {
                    data = params[0];
                }
            }
            return { data, context };
        } catch (error) {
            return { data: {}, context: '' };
        }
    }

    private parseErrorParams(params: any[]) {
        try {
            let context = '';
            let errors = null;
            let data = {};
            if (params.length > 0) {
                const lastParam = params[params.length - 1];
                if (typeof lastParam === 'string' && params.length > 1) {
                    context = lastParam;
                    errors = params[0];
                    if (params.length > 2) data = params[1];
                } else {
                    errors = params[0];
                    if (params.length > 1) data = params[1];
                }
            }
            return { errors, data, context };
        } catch (error) {
            return { errors: null, data: {}, context: '' };
        }
    }
}
