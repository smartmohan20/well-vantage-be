import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

// Increase stack trace limit for better caller detection
Error.stackTraceLimit = 25;

/**
 * Custom logger service implementing NestJS LoggerService.
 * Uses Winston for logging with daily rotation and custom formatting.
 * Features:
 * - Automatic caller file path detection
 * - Separation of application logs and NestJS internal logs
 * - Support for structured data and error logging
 */
@Injectable()
export class AppLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        // Custom format to add the caller file path and identify internal logs
        const stackPathFormat = winston.format((info) => {
            // Use provided callerStack if available (from log() method)
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

                    // Skip node internals
                    if (lowerPath.startsWith('node:') || lowerPath.includes('internal/')) {
                        continue;
                    }

                    // Skip the logger service itself
                    if (lowerPath.includes('logger.service.')) {
                        continue;
                    }

                    const isNodeModule = lowerPath.includes('node_modules');

                    try {
                        const relPath = path.relative(process.cwd(), fullRawPath);
                        const displayPath = `${relPath}:${lineNum}:${colNum}`;

                        // If it's NOT in node_modules, it's our project file!
                        if (!isNodeModule) {
                            info.filePath = displayPath;
                            info.isInternal = false;
                            foundProjectFile = true;
                            break;
                        }

                        // Use the first non-logger node_module frame as a fallback
                        if (!fallbackPath) {
                            fallbackPath = displayPath;
                        }
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

        const customFormat = winston.format.printf(
            ({ timestamp, level, filePath, message, context, data, errors }) => {
                const jsonPart = JSON.stringify({
                    message,
                    context: context || '',
                    data: data || {},
                    errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
                });
                return `${timestamp} [${level.toUpperCase()}] [${filePath}]: ${jsonPart}`;
            },
        );

        const logFormat = winston.format.combine(
            winston.format.timestamp(),
            stackPathFormat(),
            customFormat,
        );

        // Helper to create transports for app logs (non-internal)
        const createAppLevelTransport = (level: string) => {
            return new winston.transports.DailyRotateFile({
                filename: `logs/%DATE%/${level}.log`,
                datePattern: 'YYYY-MM-DD',
                level: level,
                maxFiles: '30d',
                format: winston.format.combine(
                    winston.format((info) => (info.level === level && !info.isInternal ? info : false))(),
                    logFormat,
                ),
            });
        };

        // Separate transport for framework/internal logs
        const nestTransport = new winston.transports.DailyRotateFile({
            filename: `logs/%DATE%/nest.log`,
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            format: winston.format.combine(
                winston.format((info) => (info.isInternal ? info : false))(),
                logFormat,
            ),
        });

        this.logger = winston.createLogger({
            level: 'silly',
            format: logFormat,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize({ all: true }),
                        logFormat,
                    ),
                }),
                createAppLevelTransport('error'),
                createAppLevelTransport('warn'),
                createAppLevelTransport('info'),
                createAppLevelTransport('http'),
                createAppLevelTransport('debug'),
                createAppLevelTransport('verbose'),
                createAppLevelTransport('silly'),
                nestTransport,
            ],
        });
    }

    /**
     * Log a message at the INFO level.
     * @param message - The log message.
     * @param optionalParams - Additional data or context.
     */
    log(message: any, ...optionalParams: any[]) {
        const { data, context } = this.parseParams(optionalParams);
        const callerStack = new Error().stack;
        this.logger.info(message, { data, context, callerStack });
    }

    /**
     * Log a message at the ERROR level.
     * @param message - The error message.
     * @param optionalParams - Error object, additional data, or context.
     */
    error(message: any, ...optionalParams: any[]) {
        const { data, context, errors } = this.parseErrorParams(optionalParams);
        const callerStack = new Error().stack;
        this.logger.error(message, { data, context, errors, callerStack });
    }

    /**
     * Log a message at the WARN level.
     * @param message - The warning message.
     * @param optionalParams - Additional data or context.
     */
    warn(message: any, ...optionalParams: any[]) {
        const { data, context } = this.parseParams(optionalParams);
        const callerStack = new Error().stack;
        this.logger.warn(message, { data, context, callerStack });
    }

    /**
     * Log a message at the DEBUG level.
     * @param message - The debug message.
     * @param optionalParams - Additional data or context.
     */
    debug(message: any, ...optionalParams: any[]) {
        const { data, context } = this.parseParams(optionalParams);
        const callerStack = new Error().stack;
        this.logger.debug(message, { data, context, callerStack });
    }

    /**
     * Log a message at the VERBOSE level.
     * @param message - The verbose message.
     * @param optionalParams - Additional data or context.
     */
    verbose(message: any, ...optionalParams: any[]) {
        const { data, context } = this.parseParams(optionalParams);
        const callerStack = new Error().stack;
        this.logger.verbose(message, { data, context, callerStack });
    }

    /**
     * Parses optional parameters into data and context.
     * @param params - Array of optional parameters.
     * @returns Object containing data and context.
     */
    private parseParams(params: any[]) {
        let context = '';
        let data = {};

        if (params.length > 0) {
            const lastParam = params[params.length - 1];
            if (typeof lastParam === 'string' && params.length > 0) {
                context = lastParam;
                if (params.length > 1) {
                    data = params[0];
                }
            } else {
                data = params[0];
            }
        }
        return { data, context };
    }

    /**
     * Parses optional parameters for error logging.
     * @param params - Array of optional parameters.
     * @returns Object containing errors, data, and context.
     */
    private parseErrorParams(params: any[]) {
        let context = '';
        let errors = null;
        let data = {};

        if (params.length > 0) {
            const lastParam = params[params.length - 1];
            if (typeof lastParam === 'string' && params.length > 1) {
                context = lastParam;
                errors = params[0];
                if (params.length > 2) {
                    data = params[1];
                }
            } else {
                errors = params[0];
                if (params.length > 1) {
                    data = params[1];
                }
            }
        }
        return { errors, data, context };
    }
}
