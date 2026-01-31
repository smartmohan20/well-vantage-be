import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for Google ID token authentication.
 * Used primarily by mobile applications that perform native Google login.
 */
export class GoogleSigninDto {
    @IsNotEmpty()
    @IsString()
    idToken: string;
}
