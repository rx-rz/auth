import { randomBytes } from 'crypto';

export function createChallenge(bytes = 32) {
  const buffer = randomBytes(bytes);
  const challenge = buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return challenge;
}
