import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, IsLatitude, IsLongitude, IsPhoneNumber } from 'class-validator';

export class CreateBusinessDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    houseNumber?: string;

    @IsString()
    @IsOptional()
    street?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;

    @IsUrl()
    @IsOptional()
    mapUrl?: string;

    @IsNumber()
    @IsOptional()
    @IsLatitude()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    @IsLongitude()
    longitude?: number;
}
