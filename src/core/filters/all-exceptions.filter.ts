import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppLogger } from '../../shared/logger/logger.service';

/**
 * Global exception filter to catch and format all unhandled exceptions.
 * Logs the error and returns a standard error response.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: AppLogger,
    ) { }

    /**
     * Catches and handles exceptions.
     * @param exception - The error object.
     * @param host - Arguments host for accessing request/response.
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        try {
            const { httpAdapter } = this.httpAdapterHost;

            const ctx = host.switchToHttp();

            const httpStatus =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            const responseBody = {
                statusCode: httpStatus,
                timestamp: new Date().toISOString(),
                path: httpAdapter.getRequestUrl(ctx.getRequest()),
                message: (exception as any).message || 'Internal server error',
            };

            // Log the error
            if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error('Internal Server Error', (exception as any).stack);
            } else {
                this.logger.warn(`Exception: ${JSON.stringify(responseBody)}`);
            }

            httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
        } catch (error) {
            // Fallback for when the exception filter itself fails
            console.error('Error in AllExceptionsFilter:', error);
        }
    }
}
