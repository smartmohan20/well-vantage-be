import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMembershipDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    businessId: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
