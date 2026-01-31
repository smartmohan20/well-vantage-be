import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for individual availability slot.
 */
class AvailabilityDto {
    /**
     * Start time of the session slot.
     */
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    /**
     * End time of the session slot.
     */
    @IsDateString()
    @IsNotEmpty()
    endTime: string;
}

/**
 * Data Transfer Object for setting workout session availability.
 */
export class SetAvailabilityDto {
    /**
     * The name of the workout session.
     */
    @IsString()
    @IsNotEmpty()
    sessionName: string;

    /**
     * List of availability dates/times for the session.
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailabilityDto)
    availabilities: AvailabilityDto[];
}
