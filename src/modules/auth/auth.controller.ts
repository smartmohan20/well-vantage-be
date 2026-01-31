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
import { ResponseMessage } from '../../core/decorators/response-message.decorator';

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
    @ResponseMessage('User registered successfully')
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.authService.register(createUserDto);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint for user login with email and password.
     * @param loginDto - Login credentials.
     * @returns An object containing the access and refresh tokens.
     * @throws UnauthorizedException if credentials are invalid.
     */
    @ResponseMessage('Login successful')
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const user = await this.authService.validateUser(
                loginDto.email,
                loginDto.password,
            );
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }
            return await this.authService.login(user);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint to refresh the JWT access token.
     * @param req - The request object containing user payload and refresh token.
     * @returns An object containing the new access and refresh tokens.
     */
    @ResponseMessage('Tokens refreshed successfully')
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    async refresh(@Req() req) {
        try {
            const userId = req.user.sub;
            const refreshToken = req.user.refreshToken;
            return await this.authService.refreshTokens(userId, refreshToken);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Endpoint to log out the user.
     * @param req - The request object.
     */
    @ResponseMessage('Logged out successfully')
    @UseGuards(AuthGuard('jwt'))
    @Get('logout')
    async logout(@Req() req) {
        try {
            return await this.authService.logout(req.user.id);
        } catch (error) {
            throw error;
        }
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
        try {
            const name = `${req.user.firstName} ${req.user.lastName}`.trim();
            const user = await this.authService.validateGoogleUser({
                email: req.user.email,
                googleId: req.user.googleId,
                name: name,
            });
            return await this.authService.login(user);
        } catch (error) {
            throw error;
        }
    }
}
