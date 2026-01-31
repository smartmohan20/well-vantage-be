import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../shared/logger/logger.service';
import { IStandardResponse } from '../interfaces/response.interface';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

/**
 * Global interceptor to transform response data and log requests/responses.
 * Standardizes the response format and handles conditional logging.
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, IStandardResponse<T>> {
    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) { }

    /**
     * Intercepts and transforms the response.
     * @param context - Execution context.
     * @param next - Call handler to continue the request.
     * @returns Observable that emits the transformed response.
     */
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<IStandardResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const startTime = Date.now();
        const { method, url, body, query, params } = request;

        const methodMessages: Record<string, string> = {
            GET: 'Retrieved successfully',
            POST: 'Created successfully',
            PUT: 'Updated successfully',
            PATCH: 'Updated successfully',
            DELETE: 'Deleted successfully',
        };

        // Get custom message from decorator iff present
        const customMessage = this.reflector.get<string>(
            RESPONSE_MESSAGE_KEY,
            context.getHandler(),
        );

        // Log request if enabled
        if (this.configService.get<boolean>('LOG_REQUESTS')) {
            this.logger.log(`Incoming Request: ${method} ${url}`, {
                body,
                query,
                params,
            });
        }

        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode;

                // Priority: Decorator > Explicit Property > Method Default > Fallback
                const message = customMessage ||
                    (data && typeof data === 'object' && 'message' in data ? data.message : methodMessages[method]) ||
                    'Operation successful';

                const actualData = (data && typeof data === 'object' && 'data' in data)
                    ? data.data
                    : (data && typeof data === 'object' && 'message' in data)
                        ? (({ message, ...rest }) => rest)(data)
                        : data;

                return {
                    success: true,
                    statusCode,
                    message,
                    data: actualData !== undefined ? actualData : null,
                    timestamp: new Date().toISOString(),
                };
            }),
            tap((transformedData) => {
                const duration = Date.now() - startTime;
                // Log response if enabled
                if (this.configService.get<boolean>('LOG_RESPONSES')) {
                    this.logger.log(`Outgoing Response: ${method} ${url} - ${duration}ms`, {
                        statusCode: transformedData.statusCode,
                        response: transformedData,
                    });
                }
            }),
        );
    }
}
