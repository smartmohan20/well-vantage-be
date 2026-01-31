import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Utility for JWT related operations.
 */
export const JwtUtil = {
    /**
     * Generates a pair of access and refresh tokens.
     */
    generateTokens: async (
        jwtService: JwtService,
        configService: ConfigService,
        payload: { sub: string; email: string },
    ) => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                jwtService.signAsync(payload, {
                    secret: configService.get<string>('JWT_SECRET'),
                    expiresIn: configService.get<number>('JWT_ACCESS_EXPIRATION') || 900000,
                }),
                jwtService.signAsync(payload, {
                    secret: configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: configService.get<number>('JWT_REFRESH_EXPIRATION') || 604800000,
                }),
            ]);

            return {
                access_token: accessToken,
                refresh_token: refreshToken,
            };
        } catch (error) {
            throw error;
        }
    },
};
