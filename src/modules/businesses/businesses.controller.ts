import { Controller, Post, Body, UseGuards, Req, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../core/permissions/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';

@Controller('businesses')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class BusinessesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Post()
    @RequirePermissions('business:create:global')
    @ResponseMessage('Business created successfully with OWNER membership')
    async create(@Req() req, @Body() createBusinessDto: CreateBusinessDto) {
        try {
            const userId = req.user.id;
            return await this.businessesService.create(userId, createBusinessDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ResponseMessage('Businesses retrieved successfully')
    async findAll() {
        return await this.businessesService.findAll();
    }

    @Get(':id')
    @ResponseMessage('Business details retrieved successfully')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.businessesService.findOne(id);
    }
}
