import jwt, { sign } from 'jsonwebtoken';

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  isVerified: boolean;
  roleId: string;
  role: 'rollo-admin' | string;
  mfaEnabled?: boolean;
};

export function generateAccessToken(payload: Partial<User>) {
  const secretKey = 'your_secret_key';
  const token = sign(payload, secretKey, { expiresIn: '30m' });
  return token;
}
