import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt.
 * @param password Plain-text password string
 * @returns Promise resolving to hashed password string
 */

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against a hashed password from database.
 * @param plainText Plain-text password input
 * @param hashed Hashed password stored in database
 * @returns Promise resolving to boolean match result
 */
export const comparePassword = async (
  plainText: string,
  hashed: string
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashed);
};