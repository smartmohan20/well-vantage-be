import { rateLimit } from 'express-rate-limit';

/**
 * Configuration for the API rate limiter.
 */
/**
 * Factory function to create rate limit middleware with dynamic configuration.
 */
export const rateLimitConfig = (windowMs: number, limit: number) => rateLimit({
    windowMs,
    limit,
    message: `Too many requests from this IP, please try again after ${Math.floor(windowMs / 60000)} minutes`,
    standardHeaders: true,
    legacyHeaders: false,
});
