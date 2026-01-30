import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}

/**
 * Global interceptor to transform response data.
 * Wraps the response data in a standard 'data' object.
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
    /**
     * Intercepts and transforms the response.
     * @param context - Execution context.
     * @param next - Call handler to continue the request.
     * @returns Observable that emits the transformed response.
     */
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        try {
            return next.handle().pipe(map((data) => ({ data })));
        } catch (error) {
            throw error;
        }
    }
}
