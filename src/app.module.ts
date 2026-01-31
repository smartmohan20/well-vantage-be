import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './shared/logger/logger.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { validate } from './core/config/env.config';

import { PermissionsModule } from './core/permissions/permissions.module';

import { BusinessesModule } from './modules/businesses/businesses.module';
import { MembershipsModule } from './modules/memberships/memberships.module';

/**
 * Root module of the application.
 * Responsibility: Aggregate all modules, configure global filters and interceptors.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate,
        }),
        LoggerModule,
        PrismaModule,
        PermissionsModule,
        UsersModule,
        AuthModule,
        WorkoutsModule,
        BusinessesModule,
        MembershipsModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule { }
