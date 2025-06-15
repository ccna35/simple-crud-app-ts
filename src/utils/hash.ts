import * as bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @param saltRounds - The cost factor (defaults to 10)
 * @returns A promise that resolves to the hashed password
 */
export const hashPassword = async (
  password: string,
  saltRounds = 10
): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password to check
 * @param hashedPassword - The hashed password to compare against
 * @returns A promise that resolves to a boolean indicating if the passwords match
 */
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
