import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GOOGLE_OAUTH_CONFIG } from '../../../core/config/google-oauth.config';

/**
 * Passport strategy for Google OAuth2 authentication.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: GOOGLE_OAUTH_CONFIG.clientId,
            clientSecret: GOOGLE_OAUTH_CONFIG.clientSecret,
            callbackURL: GOOGLE_OAUTH_CONFIG.callbackUrl,
            scope: GOOGLE_OAUTH_CONFIG.scopes,
        });
    }

    /**
     * Validates the Google profile and extracts user information.
     * @param accessToken - Google access token.
     * @param refreshToken - Google refresh token.
     * @param profile - Google profile object.
     * @param done - Passport verify callback.
     */
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos, id } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            googleId: id
        };
        done(null, user);
    }
}
