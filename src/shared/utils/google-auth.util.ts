import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

/**
 * Utility for Google OAuth related operations.
 */
export const GoogleAuthUtil = {
    /**
     * Creates a new OAuth2Client instance using the configuration from ConfigService.
     */
    getClient: (configService: ConfigService): OAuth2Client => {
        return new OAuth2Client(
            configService.get<string>('GOOGLE_CLIENT_ID'),
            configService.get<string>('GOOGLE_CLIENT_SECRET'),
        );
    },

    /**
     * Generates Google OAuth URL for the frontend.
     */
    getAuthUrl: (configService: ConfigService): string => {
        try {
            const client = GoogleAuthUtil.getClient(configService);
            return client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: [
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email',
                ],
                redirect_uri: configService.get<string>('GOOGLE_CALLBACK_URL'),
            });
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verifies Google ID token and returns payload.
     */
    verifyIdToken: async (configService: ConfigService, idToken: string) => {
        try {
            const client = GoogleAuthUtil.getClient(configService);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: configService.get<string>('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid Google token');
            }
            return payload;
        } catch (error) {
            throw error;
        }
    },
};
