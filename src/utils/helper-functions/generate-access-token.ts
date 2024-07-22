import jwt, { sign } from 'jsonwebtoken';

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  isVerified: boolean;
  role: 'admin' | 'user';
  mfaEnabled?: boolean;
};

export function generateAccessToken(payload: User) {
  const secretKey = 'your_secret_key';
  const token = sign(payload, secretKey, { expiresIn: '30m' });
  return token;
}
