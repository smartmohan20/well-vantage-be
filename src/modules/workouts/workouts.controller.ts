import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';

import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../core/permissions/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

/**
 * Controller for workout-related endpoints.
 */
@Controller('workouts')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) { }

    /**
     * Endpoint to create workout slots.
     * @param setAvailabilityDto - Session name and multiple availability slots.
     * @returns The created session and its availabilities.
     */
    @ResponseMessage('Workout slots created successfully')
    @RequirePermissions('MANAGE_BUSINESS')
    @Post('slots')
    async setAvailability(@Body() setAvailabilityDto: SetAvailabilityDto) {
        try {
            return await this.workoutsService.setAvailability(setAvailabilityDto);
        } catch (error) {
            throw error;
        }
    }


}
