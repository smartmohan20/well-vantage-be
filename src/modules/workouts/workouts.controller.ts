import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { CreateSlotsDto } from './dto/create-slots.dto';

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

    /**
     * Endpoint to create slots for a specific session availability.
     * @param availabilityId - The ID of the session availability.
     * @param createSlotsDto - Data containing slots.
     * @returns The updated session availability with new slots.
     */
    @ResponseMessage('Slots created successfully')
    @RequirePermissions('MANAGE_BUSINESS')
    @Post('availability/:id/slots')
    async createSlots(@Param('id') availabilityId: string, @Body() createSlotsDto: CreateSlotsDto) {
        try {
            return await this.workoutsService.createSlots(availabilityId, createSlotsDto);
        } catch (error) {
            throw error;
        }
    }


}
