import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../core/permissions/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Controller('memberships')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    @RequirePermissions('business:manage:own')
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipsService.create(createMembershipDto);
    }

    @Get()
    @RequirePermissions('member:read:business')
    findAll() {
        return this.membershipsService.findAll();
    }

    @Get(':id')
    @RequirePermissions('member:read:business')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.membershipsService.findOne(id);
    }

    @Delete(':id')
    @RequirePermissions('business:manage:own')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.membershipsService.remove(id);
    }
}
