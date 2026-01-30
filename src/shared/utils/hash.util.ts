import * as bcrypt from 'bcrypt';

/**
 * Hashes a plain text password using bcrypt.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw error;
    }
}

/**
 * Compares a plain text password with a hash.
 * @param password - The plain text password.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to true if they match, false otherwise.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw error;
    }
}
