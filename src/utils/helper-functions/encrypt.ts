import { createCipheriv, randomBytes } from 'crypto';

export function encrypt(text: string, encryptionKey: Buffer) {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-ccm', Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
