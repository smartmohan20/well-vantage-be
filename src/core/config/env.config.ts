import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

/**
 * Supported environment types.
 */
export enum Environment {
    Development = 'development',
    Test = 'test',
    Production = 'production',
}

/**
 * Validates the presence and format of environment variables.
 */
export class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    ALLOWED_ORIGINS: string;

    @IsString()
    JWT_SECRET: string;

    @IsString()
    JWT_REFRESH_SECRET: string;

    @IsNumber()
    JWT_ACCESS_EXPIRATION: number;

    @IsNumber()
    JWT_REFRESH_EXPIRATION: number;

    @IsString()
    GOOGLE_CLIENT_ID: string;

    @IsString()
    GOOGLE_CLIENT_SECRET: string;

    @IsString()
    GOOGLE_CALLBACK_URL: string;

    @IsString()
    SESSION_SECRET: string;

    @IsString()
    LOG_LEVEL: string;

    @IsBoolean()
    LOG_REQUESTS: boolean;

    @IsBoolean()
    LOG_RESPONSES: boolean;

    @IsNumber()
    RATE_LIMIT_WINDOW_MS: number;

    @IsNumber()
    RATE_LIMIT_MAX: number;
}

/**
 * Validation function for @nestjs/config.
 * @param config - The raw environment variables.
 * @returns The validated environment variables object.
 * @throws Error if validation fails.
 */
export function validate(config: Record<string, unknown>) {
    try {
        const validatedConfig = plainToInstance(
            EnvironmentVariables,
            config,
            { enableImplicitConversion: true },
        );
        const errors = validateSync(validatedConfig, {
            skipMissingProperties: false,
        });

        if (errors.length > 0) {
            throw new Error(errors.toString());
        }
        return validatedConfig;
    } catch (error) {
        throw error;
    }
}
