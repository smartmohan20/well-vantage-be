import { googleClient, GOOGLE_OAUTH_CONFIG } from '../../core/config/google-oauth.config';

/**
 * Utility for Google OAuth related operations.
 */
export const GoogleAuthUtil = {
    /**
     * Generates Google OAuth URL for the frontend.
     */
    getAuthUrl: (): string => {
        try {
            return googleClient.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: GOOGLE_OAUTH_CONFIG.scopes,
                redirect_uri: GOOGLE_OAUTH_CONFIG.callbackUrl,
            });
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verifies Google ID token and returns payload.
     */
    verifyIdToken: async (idToken: string) => {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_OAUTH_CONFIG.clientId,
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
