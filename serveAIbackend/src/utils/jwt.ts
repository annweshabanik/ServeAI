import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing in .env file.');
  }
  return secret;
};


/**
 * Signs a JWT payload and returns a token string.
 * @param payload Payload containing userId and role
 * @param expiresIn Token expiration duration (default '7d')
 * @returns Signed JWT string
 */

export const signToken = (
  payload: JwtPayload,
  expiresIn: string = '7d'
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getSecret(), options);
};


/**
 * Verifies a JWT token string and returns the decoded payload.
 * @param token JWT token string
 * @returns Decoded JwtPayload object
 */


export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload;
};