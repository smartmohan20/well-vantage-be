import { Controller, Post, Body, UseGuards, Req, Param, Get, Query } from '@nestjs/common';
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
     * Endpoint to set workout availabilities.
     * @param setAvailabilityDto - Session name and multiple availability ranges.
     * @returns The created session and its availabilities.
     */
    @ResponseMessage('Workout availabilities created successfully')
    @RequirePermissions('business:manage:own')
    @Post('availabilities')
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
    @RequirePermissions('business:manage:own')
    @Post('availability/:id/slots')
    async createSlots(@Param('id') availabilityId: string, @Body() createSlotsDto: CreateSlotsDto) {
        try {
            return await this.workoutsService.createSlots(availabilityId, createSlotsDto);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint to get workout availabilities for a particular gym.
     * @param businessId - The ID of the gym.
     * @param from - Start date filter (optional).
     * @param to - End date filter (optional).
     * @returns List of workout sessions with availabilities.
     */
    @ResponseMessage('Availabilities retrieved successfully')
    @RequirePermissions('workout:read:business')
    @Get('business/:businessId/availabilities')
    async getAvailabilities(
        @Param('businessId') businessId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        try {
            return await this.workoutsService.getAvailabilities(businessId, from, to);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint to get available workout slots for a particular gym.
     * @param businessId - The ID of the gym.
     * @param date - Optional date filter.
     * @returns List of available slots.
     */
    @ResponseMessage('Available slots retrieved successfully')
    @RequirePermissions('workout:read:business')
    @Get('business/:businessId/slots/available')
    async getAvailableSlots(
        @Param('businessId') businessId: string,
        @Query('date') date?: string,
    ) {
        try {
            return await this.workoutsService.getAvailableSlots(businessId, date);
        } catch (error) {
            throw error;
        }
    }
}
