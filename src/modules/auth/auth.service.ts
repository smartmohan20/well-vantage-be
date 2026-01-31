import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
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
        private prisma: PrismaService,
    ) { }

    async register(createUserDto: CreateUserDto) {
        try {
            return await this.usersService.create(createUserDto);
        } catch (error) {
            throw error;
        }
    }

    async validateUser(email: string, pass: string) {
        try {
            const auth = await this.prisma.auth.findUnique({
                where: { email },
                include: { user: true },
            });
            if (auth && (await comparePassword(pass, auth.password))) {
                return {
                    ...auth.user,
                    email: auth.email,
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    getGoogleAuthUrl() {
        return GoogleAuthUtil.getAuthUrl(this.configService);
    }

    async validateGoogleUser(details: { email: string; googleId: string; name: string }) {
        try {
            let auth = await this.prisma.auth.findUnique({
                where: { email: details.email },
                include: { user: true },
            });

            if (auth) {
                if (!auth.googleId) {
                    auth = await this.prisma.auth.update({
                        where: { id: auth.id },
                        data: { googleId: details.googleId },
                        include: { user: true },
                    });
                }
                return {
                    ...auth.user,
                    email: auth.email,
                };
            }

            // Create new user. Needs phone number. Generating a placeholder.
            const user = await this.usersService.create({
                email: details.email,
                password: StringUtil.generateRandomString(16),
                googleId: details.googleId,
                name: details.name,
                phoneNumber: `PENDING-${StringUtil.generateRandomString(10)}`,
            });

            return {
                ...user,
                email: user.auth.email,
            };
        } catch (error) {
            throw error;
        }
    }

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

    async login(user: any) {
        try {
            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRefreshToken(user.id, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw error;
        }
    }

    async updateRefreshToken(userId: string, refreshToken: string | null) {
        try {
            const hashedRefreshToken = refreshToken ? await hashPassword(refreshToken) : null;
            // Need to update Auth table, find by userId
            await this.prisma.auth.update({
                where: { userId },
                data: {
                    refreshToken: hashedRefreshToken,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async getTokens(userId: string, email: string) {
        return JwtUtil.generateTokens(this.jwtService, this.configService, {
            sub: userId,
            email,
        });
    }

    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const auth = await this.prisma.auth.findUnique({
                where: { userId },
                include: { user: true },
            });
            if (!auth || !auth.refreshToken) {
                throw new ForbiddenException('Access Denied');
            }

            const refreshTokenMatches = await comparePassword(
                refreshToken,
                auth.refreshToken,
            );
            if (!refreshTokenMatches) {
                throw new ForbiddenException('Access Denied');
            }

            const tokens = await this.getTokens(auth.userId, auth.email);
            await this.updateRefreshToken(auth.userId, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw error;
        }
    }

    async logout(userId: string) {
        try {
            await this.prisma.auth.update({
                where: { userId },
                data: { refreshToken: null },
            });
        } catch (error) {
            throw error;
        }
    }
}

