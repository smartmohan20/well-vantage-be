import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
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
}
