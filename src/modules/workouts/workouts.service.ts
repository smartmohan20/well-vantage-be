import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { CreateSlotsDto } from './dto/create-slots.dto';


/**
 * Service responsible for workout session and availability operations.
 */
@Injectable()
export class WorkoutsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Sets availability for a workout session.
     * Creates a new session and its associated availability slots.
     * @param setAvailabilityDto - Data containing session name and availability slots.
     * @returns The created workout session with its availabilities.
     */
    async setAvailability(setAvailabilityDto: SetAvailabilityDto) {
        try {
            return await this.prisma.workoutSession.create({
                data: {
                    name: setAvailabilityDto.sessionName,
                    business: { connect: { id: setAvailabilityDto.businessId } },
                    availabilities: {
                        create: setAvailabilityDto.availabilities.map((slot) => ({
                            startTime: new Date(slot.startTime),
                            endTime: new Date(slot.endTime),
                        })),
                    },
                },
                include: {
                    availabilities: true,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates slots for a specific session availability.
     * @param availabilityId - The ID of the session availability.
     * @param createSlotsDto - Data containing slots.
     * @returns The updated session availability with new slots.
     */
    async createSlots(availabilityId: string, createSlotsDto: CreateSlotsDto) {
        try {
            const availability = await this.prisma.sessionAvailability.findUnique({
                where: { id: availabilityId },
            });

            if (!availability) {
                throw new NotFoundException('Session availability not found');
            }

            return await this.prisma.sessionAvailability.update({
                where: { id: availabilityId },
                data: {
                    slots: {
                        create: createSlotsDto.slots.map((slot) => ({
                            startTime: new Date(slot.startTime),
                            endTime: new Date(slot.endTime),
                        })),
                    },
                },
                include: {
                    slots: true,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves all workout availabilities for a specific gym within a date range.
     * @param gymId - The ID of the gym (business).
     * @param from - Start date filter (optional).
     * @param to - End date filter (optional).
     * @returns List of workout sessions with filtered availabilities.
     */
    async getAvailabilities(gymId: string, from?: string, to?: string) {
        try {
            const whereClause: any = {
                businessId: gymId,
            };

            const availabilityWhere: any = {};

            if (from) {
                availabilityWhere.startTime = {
                    gte: new Date(from),
                };
            }

            if (to) {
                availabilityWhere.endTime = {
                    ...availabilityWhere.endTime,
                    lte: new Date(to),
                };
            }

            // If we have date filters, we want to ensure we only get sessions that have availabilities in that range
            // But Prisma include filtering is what we need to filter the availabilities relation

            const sessions = await this.prisma.workoutSession.findMany({
                where: whereClause,
                include: {
                    availabilities: {
                        where: availabilityWhere,
                        include: {
                            slots: true
                        }
                    },
                },
            });

            // Filter out sessions that have no availabilities matching the criteria (optional, but cleaner)
            return sessions.filter(session => session.availabilities.length > 0);

        } catch (error) {
            throw error;
        }
    }


}
