import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../core/permissions/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';

@Controller('gyms')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class GymsController {
    constructor(private readonly gymsService: GymsService) { }

    @Post()
    @RequirePermissions('CREATE_GYM')
    @ResponseMessage('Gym created successfully and role updated to GYM_OWNER')
    async create(@Req() req, @Body() createGymDto: CreateGymDto) {
        try {
            const userId = req.user.id;
            return await this.gymsService.create(userId, createGymDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ResponseMessage('Gyms retrieved successfully')
    async findAll() {
        return await this.gymsService.findAll();
    }

    @Get(':id')
    @ResponseMessage('Gym details retrieved successfully')
    async findOne(@Param('id') id: string) {
        return await this.gymsService.findOne(id);
    }
}
