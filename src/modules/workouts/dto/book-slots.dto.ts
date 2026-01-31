import { IsArray, IsString, IsNotEmpty, ArrayMinSize } from 'class-validator';

/**
 * DTO for booking one or more workout slots.
 */
export class BookSlotsDto {
    /**
     * List of SessionAvailability IDs to book.
     */
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    slotIds: string[];
}
