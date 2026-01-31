import * as crypto from 'crypto';

/**
 * Utility for string related operations.
 */
export const StringUtil = {
    /**
     * Generates a random secure hex string of specified length.
     * @param length - The number of bytes to generate.
     * @returns A hex string.
     */
    generateRandomString: (length: number = 16): string => {
        return crypto.randomBytes(length).toString('hex');
    },

    /**
     * Capitalizes the first letter of a string.
     */
    capitalize: (str: string): string => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
};
