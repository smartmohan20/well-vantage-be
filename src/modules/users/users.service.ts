import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../../shared/utils/hash.util';
import { User } from '@prisma/client';

/**
 * Service responsible for user-related operations.
 */
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Creates a new user in the system.
     * @param createUserDto - Data for creating the user.
     * @returns The created user object.
     * @throws ConflictException if the user with the same email already exists.
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const existing = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existing) {
                throw new ConflictException('User with this email already exists');
            }

            const hashedPassword = await hashPassword(createUserDto.password);

            return await this.prisma.user.create({
                data: {
                    email: createUserDto.email,
                    password: hashedPassword,
                    name: createUserDto.name,
                    googleId: createUserDto.googleId,
                },
            });
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            throw error; // Let global filter handle unknown errors
        }
    }

    /**
     * Finds a user by their email address.
     * @param email - The email to search for.
     * @returns The user object if found, otherwise null.
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({ where: { email } });
        } catch (error) {
            return null;
        }
    }

    /**
     * Finds a user by their unique identifier.
     * @param id - The unique ID of the user.
     * @returns The user object if found, otherwise null.
     */
    async findById(id: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({ where: { id } });
        } catch (error) {
            return null;
        }
    }

    /**
     * Updates an existing user's information.
     * @param id - The unique ID of the user to update.
     * @param data - The data to update.
     * @returns The updated user object.
     */
    async update(id: string, data: Partial<User>): Promise<User> {
        try {
            return await this.prisma.user.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw error;
        }
    }
}

