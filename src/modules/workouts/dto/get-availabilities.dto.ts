import { IsOptional, IsDateString } from 'class-validator';

export class GetAvailabilitiesQueryDto {
    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;
}
