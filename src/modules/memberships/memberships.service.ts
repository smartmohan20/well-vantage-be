import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Injectable()
export class MembershipsService {
    constructor(private prisma: PrismaService) { }

    async create(createMembershipDto: CreateMembershipDto) {
        // Check if membership already exists
        const existing = await this.prisma.membership.findFirst({
            where: {
                userId: createMembershipDto.userId,
                businessId: createMembershipDto.businessId
            }
        });

        if (existing) {
            throw new ConflictException('Membership already exists');
        }

        return this.prisma.membership.create({
            data: createMembershipDto,
            include: {
                user: true,
                business: true,
            },
        });
    }

    async findAll() {
        return this.prisma.membership.findMany({
            include: {
                user: true,
                business: true,
            },
        });
    }

    async findOne(id: string) {
        const membership = await this.prisma.membership.findUnique({
            where: { id },
            include: {
                user: true,
                business: true,
            },
        });

        if (!membership) {
            throw new NotFoundException(`Membership with ID ${id} not found`);
        }

        return membership;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.membership.delete({
            where: { id },
        });
    }
}
