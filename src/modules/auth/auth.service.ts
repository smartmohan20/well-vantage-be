import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { comparePassword } from '../../shared/utils/hash.util';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

/**
 * Service responsible for authentication-related logic.
 * Handles user registration, validation, and login.
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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
     * Validates or creates a user based on Google OAuth details.
     * @param details - Google user details (email, googleId, name).
     * @returns The user object.
     */
    async validateGoogleUser(details: { email: string; googleId: string; name: string }) {
        try {
            const user = await this.usersService.findByEmail(details.email);
            if (user) {
                return user;
            }
            return await this.usersService.create({
                email: details.email,
                password: crypto.randomBytes(16).toString('hex'),
                googleId: details.googleId,
                name: details.name,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generates a JWT access token for the user.
     * @param user - The user object to generate the token for.
     * @returns An object containing the access token.
     */
    async login(user: User) {
        try {
            const payload = { email: user.email, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload),
            };
        } catch (error) {
            throw error;
        }
    }
}

