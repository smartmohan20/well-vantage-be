import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MembershipsController],
    providers: [MembershipsService],
    exports: [MembershipsService],
})
export class MembershipsModule { }
