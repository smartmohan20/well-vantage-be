import { IsOptional, IsDateString } from 'class-validator';

export class GetAvailableSlotsQueryDto {
    @IsOptional()
    @IsDateString()
    date?: string;
}
