import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { comparePassword, hashPassword } from '../../shared/utils/hash.util';
import { User } from '@prisma/client';
import { StringUtil } from '../../shared/utils/string.util';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthUtil } from '../../shared/utils/google-auth.util';
import { JwtUtil } from '../../shared/utils/jwt.util';

/**
 * Service responsible for authentication-related logic.
 * Handles user registration, validation, and login.
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Registers a new user.
     * @param createUserDto - Data for creating the user.
     * @returns The newly created user.
     */
    async register(createUserDto: CreateUserDto) {
        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validates a user's credentials.
     * @param email - User's email address.
     * @param pass - User's plain text password.
     * @returns The user object if validation succeeds, otherwise null.
     */
    async validateUser(email: string, pass: string): Promise<User | null> {
        try {
            const user = await this.usersService.findByEmail(email);
            if (user && (await comparePassword(pass, user.password))) {
                return user;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generates Google OAuth URL for the frontend.
     * @returns The Google OAuth URL.
     */
    getGoogleAuthUrl() {
        return GoogleAuthUtil.getAuthUrl(this.configService);
    }

    /**
     * Validates or creates a user based on Google OAuth details.
     * @param details - Google user details (email, googleId, name).
     * @returns The user object.
     */
    async validateGoogleUser(details: { email: string; googleId: string; name: string }) {
        try {
            const user = await this.usersService.findByEmail(details.email);
            if (user) {
                // Update googleId if not present (in case of manual signup earlier)
                if (!user.googleId) {
                    await this.usersService.update(user.id, { googleId: details.googleId });
                }
                return user;
            }
            return await this.usersService.create({
                email: details.email,
                password: StringUtil.generateRandomString(16),
                googleId: details.googleId,
                name: details.name,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validates Google ID token from mobile or web direct login.
     * Uses the reusable googleClient instance.
     * @param idToken - The ID token from Google.
     * @returns The user object.
     */
    async validateGoogleIdToken(idToken: string) {
        try {
            const payload = await GoogleAuthUtil.verifyIdToken(this.configService, idToken);
            const { email, sub: googleId, name } = payload;

            return await this.validateGoogleUser({
                email: email!,
                googleId,
                name: name!,
            });
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Google authentication failed');
        }
    }

    /**
     * Handles the login logic by generating tokens and updating the refresh token in the database.
     * @param user - The user object.
     * @returns An object containing the access and refresh tokens.
     */
    async login(user: User) {
        try {
            const tokens = await this.getTokens(user.id, user.email, user.role);
            await this.updateRefreshToken(user.id, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates the user's refresh token in the database after hashing it.
     * @param userId - The ID of the user.
     * @param refreshToken - The plain text refresh token.
     */
    async updateRefreshToken(userId: string, refreshToken: string | null) {
        try {
            const hashedRefreshToken = refreshToken ? await hashPassword(refreshToken) : null;
            await this.usersService.update(userId, {
                refreshToken: hashedRefreshToken,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generates a pair of access and refresh tokens.
     * @param userId - The ID of the user.
     * @param email - The email of the user.
     * @returns An object containing both tokens.
     */
    async getTokens(userId: string, email: string, role: string) {
        return JwtUtil.generateTokens(this.jwtService, this.configService, {
            sub: userId,
            email,
            role,
        });
    }

    /**
     * Refreshes the access token using a valid refresh token.
     * @param userId - The ID of the user.
     * @param refreshToken - The refresh token provided by the client.
     * @returns An object containing the new tokens.
     */
    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.usersService.findById(userId);
            if (!user || !user.refreshToken) {
                throw new ForbiddenException('Access Denied');
            }

            const refreshTokenMatches = await comparePassword(
                refreshToken,
                user.refreshToken,
            );
            if (!refreshTokenMatches) {
                throw new ForbiddenException('Access Denied');
            }

            const tokens = await this.getTokens(user.id, user.email, user.role);
            await this.updateRefreshToken(user.id, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logs out the user by clearing their refresh token from the database.
     * @param userId - The ID of the user.
     */
    async logout(userId: string) {
        try {
            await this.usersService.update(userId, { refreshToken: null });
        } catch (error) {
            throw error;
        }
    }
}

