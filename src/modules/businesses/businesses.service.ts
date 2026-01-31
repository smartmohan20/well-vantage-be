import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createBusinessDto: CreateBusinessDto) {
        try {
            // Create the business and create a membership with role OWNER
            return await this.prisma.$transaction(async (tx) => {
                const business = await tx.business.create({
                    data: {
                        ...createBusinessDto,
                        ownerId: userId,
                        memberships: {
                            create: {
                                userId,
                                role: 'OWNER',
                            },
                        },
                    },
                    include: {
                        memberships: true,
                        owner: true,
                    },
                });

                return business;
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        return this.prisma.business.findMany({
            include: {
                owner: true,
                memberships: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.business.findUnique({
            where: { id },
            include: {
                owner: true,
                memberships: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
}
