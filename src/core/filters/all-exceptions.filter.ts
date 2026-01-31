import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../shared/logger/logger.service';
import { IStandardResponse } from '../interfaces/response.interface';

/**
 * Global exception filter to catch and format all unhandled exceptions.
 * Logs the error and returns a standard error response matching the IStandardResponse format.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
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
            const request = ctx.getRequest();

            const httpStatus =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            const exceptionResponse =
                exception instanceof HttpException ? exception.getResponse() : null;

            const message =
                typeof exceptionResponse === 'object' && exceptionResponse !== null
                    ? (exceptionResponse as any).message || (exception as any).message
                    : (exception as any).message || 'Internal server error';

            const errorName =
                typeof exceptionResponse === 'object' && exceptionResponse !== null
                    ? (exceptionResponse as any).error || (exception as any).name
                    : (exception as any).name || 'Internal Server Error';

            const responseBody: IStandardResponse<null> = {
                success: false,
                statusCode: httpStatus,
                message: Array.isArray(message) ? message[0] : message,
                error: errorName,
                path: httpAdapter.getRequestUrl(request),
                timestamp: new Date().toISOString(),
            };

            // Log the error
            const logResponses = this.configService.get<boolean>('LOG_RESPONSES');
            const { method, url } = request;
            const logMessage = `Exception: ${method} ${url} - ${httpStatus}`;

            if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error(logMessage, (exception as any).stack, {
                    path: httpAdapter.getRequestUrl(request),
                });
            } else if (logResponses) {
                this.logger.warn(logMessage, responseBody);
            }

            httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
        } catch (error) {
            // Fallback for when the exception filter itself fails
            console.error('Error in AllExceptionsFilter:', error);
        }
    }
}
