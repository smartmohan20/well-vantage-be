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
        payload: { sub: string; email: string; role: string },
    ) => {
        try {
            const jwtSecret = configService.get<string>('JWT_SECRET');
            const jwtAccessExpiration = configService.get<number>('JWT_ACCESS_EXPIRATION') || 900000;
            const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
            const jwtRefreshExpiration = configService.get<number>('JWT_REFRESH_EXPIRATION') || 604800000;

            const [accessToken, refreshToken] = await Promise.all([
                jwtService.signAsync(payload, {
                    secret: jwtSecret,
                    expiresIn: jwtAccessExpiration,
                }),
                jwtService.signAsync(payload, {
                    secret: jwtRefreshSecret,
                    expiresIn: jwtRefreshExpiration,
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
