import {
    ValidationPipe,
    ValidationError,
    BadRequestException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors: ValidationError[]) => {
                const messages = errors.map((error) => {
                    const constraints = error.constraints
                        ? Object.values(error.constraints).join(', ')
                        : 'Invalid value';
                    return `${error.property}: ${constraints}`;
                });
                return new BadRequestException(messages);
            },
        });
    }
}
