import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Passport strategy for validating JWT refresh tokens.
 * Extracts the token from the Authorization header and passes it to the validate method.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    /**
     * Validates the refresh token payload and returns it along with the plain token.
     * @param req - The request object.
     * @param payload - The decoded JWT payload.
     * @returns An object containing the user ID and the refresh token.
     */
    validate(req: Request, payload: any) {
        const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
        return {
            ...payload,
            refreshToken,
        };
    }
}
