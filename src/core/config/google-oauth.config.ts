import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded if this file is imported outside of NestJS context
dotenv.config();

/**
 * Google OAuth Configuration constants.
 */
export const GOOGLE_OAUTH_CONFIG = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    scopes: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ],
};

/**
 * Pre-configured Google OAuth2 client instance.
 * Can be imported and used anywhere in the application.
 */
export const googleClient = new OAuth2Client(
    GOOGLE_OAUTH_CONFIG.clientId,
    GOOGLE_OAUTH_CONFIG.clientSecret,
);
