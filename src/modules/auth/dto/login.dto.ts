import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for user login.
 */
export class LoginDto {
    /**
     * User's email address.
     */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /**
     * User's password.
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
