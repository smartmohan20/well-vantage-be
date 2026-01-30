import {
    Controller,
    Post,
    Body,
    Get,
    UnauthorizedException,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * Controller responsible for handling authentication requests.
 * Provides endpoints for signup, login, and Google OAuth.
 */
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Endpoint for user registration.
     * @param createUserDto - User creation data.
     * @returns The newly created user.
     */
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    /**
     * Endpoint for user login with email and password.
     * @param loginDto - Login credentials.
     * @returns An object containing the access and refresh tokens.
     * @throws UnauthorizedException if credentials are invalid.
     */
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    /**
     * Endpoint to refresh the JWT access token.
     * @param req - The request object containing user payload and refresh token.
     * @returns An object containing the new access and refresh tokens.
     */
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    async refresh(@Req() req) {
        const userId = req.user.sub;
        const refreshToken = req.user.refreshToken;
        return this.authService.refreshTokens(userId, refreshToken);
    }

    /**
     * Endpoint to log out the user.
     * @param req - The request object.
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('logout')
    async logout(@Req() req) {
        return this.authService.logout(req.user.id);
    }

    /**
     * Endpoint to initiate Google OAuth login flow.
     */
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // Initiates the Google OAuth2 login flow
    }

    /**
     * Callback endpoint for Google OAuth redirection.
     * Validates or creates the user and returns tokens.
     * @param req - The request object containing user details from Google.
     * @returns An object containing the access and refresh tokens.
     */
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        const name = `${req.user.firstName} ${req.user.lastName}`.trim();
        const user = await this.authService.validateGoogleUser({
            email: req.user.email,
            googleId: req.user.googleId,
            name: name,
        });
        return this.authService.login(user);
    }
}
