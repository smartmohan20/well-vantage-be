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
     * Creates a new user in the system with authentication details.
     * @param createUserDto - Data for creating the user.
     * @returns The created user object including auth details.
     * @throws ConflictException if the user with the same email or phone number already exists.
     */
    async create(createUserDto: CreateUserDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const existingAuth = await tx.auth.findUnique({
                    where: { email: createUserDto.email },
                });
                if (existingAuth) {
                    throw new ConflictException('User with this email already exists');
                }

                const existingPhone = await tx.user.findUnique({
                    where: { phoneNumber: createUserDto.phoneNumber },
                });
                if (existingPhone) {
                    throw new ConflictException('User with this phone number already exists');
                }

                const hashedPassword = await hashPassword(createUserDto.password);

                return await tx.user.create({
                    data: {
                        name: createUserDto.name,
                        phoneNumber: createUserDto.phoneNumber,
                        auth: {
                            create: {
                                email: createUserDto.email,
                                password: hashedPassword,
                                googleId: createUserDto.googleId,
                            },
                        },
                    },
                    include: {
                        auth: true,
                    },
                });
            });
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            throw error;
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

