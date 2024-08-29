import { randomBytes } from 'crypto';
import { hashValue } from './hash-value';

export function generateHashedRefreshToken(bytes = 32) {
  const buffer = randomBytes(bytes);
  const token = buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return token;
}
