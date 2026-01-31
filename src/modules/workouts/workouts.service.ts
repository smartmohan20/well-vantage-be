import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';


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


}
