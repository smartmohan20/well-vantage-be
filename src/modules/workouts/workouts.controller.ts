import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { BookSlotsDto } from './dto/book-slots.dto';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { AuthGuard } from '@nestjs/passport';

/**
 * Controller for workout-related endpoints.
 */
@Controller('workouts')
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) { }

    /**
     * Endpoint to set availability for a workout session.
     * @param setAvailabilityDto - Session name and multiple availability slots.
     * @returns The created session and its availabilities.
     */
    @ResponseMessage('Workout session availability set successfully')
    @UseGuards(AuthGuard('jwt'))
    @Post('availability')
    async setAvailability(@Body() setAvailabilityDto: SetAvailabilityDto) {
        try {
            return await this.workoutsService.setAvailability(setAvailabilityDto);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint for a client to book one or more slots.
     * @param req - The request object containing user payload.
     * @param bookSlotsDto - List of slot IDs to book.
     * @returns The created bookings.
     */
    @ResponseMessage('Slots booked successfully')
    @UseGuards(AuthGuard('jwt'))
    @Post('book')
    async bookSlots(@Req() req, @Body() bookSlotsDto: BookSlotsDto) {
        try {
            const userId = req.user.id;
            return await this.workoutsService.bookSlots(userId, bookSlotsDto);
        } catch (error) {
            throw error;
        }
    }
}
