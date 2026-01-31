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
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        return new OAuth2Client(clientId, clientSecret);
    },

    /**
     * Generates Google OAuth URL for the frontend.
     */
    getAuthUrl: (configService: ConfigService): string => {
        try {
            const redirectUri = configService.get<string>('GOOGLE_CALLBACK_URL');
            const client = GoogleAuthUtil.getClient(configService);
            return client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: [
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email',
                ],
                redirect_uri: redirectUri,
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
            const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
            const client = GoogleAuthUtil.getClient(configService);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: clientId,
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
