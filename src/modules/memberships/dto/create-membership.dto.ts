import { IsString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMembershipDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsNotEmpty()
    businessId: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
