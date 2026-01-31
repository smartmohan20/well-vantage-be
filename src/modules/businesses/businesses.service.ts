import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createBusinessDto: CreateBusinessDto) {
        try {
            // Create the business and update the user role to BUSINESS_OWNER in a transaction
            return await this.prisma.$transaction(async (tx) => {
                const business = await tx.business.create({
                    data: {
                        ...createBusinessDto,
                        ownerId: userId,
                    },
                });

                await tx.user.update({
                    where: { id: userId },
                    data: { role: 'BUSINESS_OWNER' },
                });

                return business;
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        return this.prisma.business.findMany({
            include: { owner: true }
        });
    }

    async findOne(id: string) {
        return this.prisma.business.findUnique({
            where: { id },
            include: { owner: true }
        });
    }
}
