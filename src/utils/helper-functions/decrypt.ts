import { createDecipheriv } from 'crypto';

export function decrypt(encryptedText: string, encryptionKey: Buffer) {
  const [iv, encrypted] = encryptedText.split(':');
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedTextBuffer = Buffer.from(encrypted, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), ivBuffer);
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
