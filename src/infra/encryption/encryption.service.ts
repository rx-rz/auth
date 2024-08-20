import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private iv: Buffer;

  constructor(encryptionKey: string) {
    this.key = scryptSync(encryptionKey, randomBytes(12), 32);
    this.iv = randomBytes(16);
  }

  encrypt(text: string) {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted = cipher.final('hex');
    return this.iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
