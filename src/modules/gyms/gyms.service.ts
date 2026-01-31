import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';

@Injectable()
export class GymsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createGymDto: CreateGymDto) {
        try {
            // Create the gym and update the user role to GYM_OWNER in a transaction
            return await this.prisma.$transaction(async (tx) => {
                const gym = await tx.gym.create({
                    data: {
                        ...createGymDto,
                        ownerId: userId,
                    },
                });

                await tx.user.update({
                    where: { id: userId },
                    data: { role: 'GYM_OWNER' },
                });

                return gym;
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        return this.prisma.gym.findMany({
            include: { owner: true }
        });
    }

    async findOne(id: string) {
        return this.prisma.gym.findUnique({
            where: { id },
            include: { owner: true }
        });
    }
}
