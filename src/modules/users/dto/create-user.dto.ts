import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for user registration.
 */
export class CreateUserDto {
    /**
     * User's email address. Must be a valid email format.
     */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    /**
     * User's password. Must be at least 6 characters long.
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    /**
     * User's full name.
     */
    @IsString()
    @IsNotEmpty()
    name: string;

    /**
     * Unique identifier from Google if account is linked via OAuth.
     */
    @IsOptional()
    @IsString()
    googleId?: string;
}
