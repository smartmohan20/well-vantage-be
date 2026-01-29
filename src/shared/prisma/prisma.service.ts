import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service to handle Prisma database connections.
 * Extends PrismaClient to provide database access throughout the application.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    /**
     * Connects to the database when the module is initialized.
     */
    async onModuleInit() {
        await this.$connect();
    }

    /**
     * Disconnects from the database when the module is destroyed.
     */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
