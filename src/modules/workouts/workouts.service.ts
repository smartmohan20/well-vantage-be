import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { BookSlotsDto } from './dto/book-slots.dto';

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

    /**
     * Books one or more slots for a user.
     * Checks if slots are available and creates booking records.
     * @param userId - ID of the user booking the slots.
     * @param bookSlotsDto - List of slot IDs to book.
     * @returns The created bookings.
     */
    async bookSlots(userId: string, bookSlotsDto: BookSlotsDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const results = [];

                for (const slotId of bookSlotsDto.slotIds) {
                    const slot = await tx.sessionAvailability.findUnique({
                        where: { id: slotId },
                        include: { booking: true },
                    });

                    if (!slot) {
                        throw new NotFoundException(`Slot with ID ${slotId} not found`);
                    }

                    if (slot.booking) {
                        throw new ConflictException(`Slot with ID ${slotId} is already booked`);
                    }

                    const booking = await tx.booking.create({
                        data: {
                            userId,
                            availabilityId: slotId,
                        },
                    });
                    results.push(booking);
                }

                return results;
            });
        } catch (error) {
            throw error;
        }
    }
}
