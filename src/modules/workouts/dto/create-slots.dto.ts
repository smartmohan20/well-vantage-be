import { IsDateString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SlotDto {
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;
}

export class CreateSlotsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SlotDto)
    slots: SlotDto[];
}
