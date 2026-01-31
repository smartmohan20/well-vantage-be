import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Controller('memberships')
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipsService.create(createMembershipDto);
    }

    @Get()
    findAll() {
        return this.membershipsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.membershipsService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.membershipsService.remove(id);
    }
}
