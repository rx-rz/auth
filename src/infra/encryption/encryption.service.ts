import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-192-cbc';
  private key: Buffer;

  constructor(encryptionKey: string) {
    encryptionKey = process.env.MASTER_KEY ?? '';
    if (encryptionKey.length !== 32) {
      throw new Error('Encryption key must be 32 bytes long');
    }
    this.key = scryptSync(encryptionKey, 'salt', 24);
  }

  generateIV() {
    return randomBytes(16);
  }

  encrypt(text: string) {
    const iv = this.generateIV();
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = cipher.update(text, 'utf8', 'hex');
    return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
  }

  decrypt(encryptedText: string) {
    const [encrypted, iv] = encryptedText.split('|');
    if (!iv) throw new Error('IV not found');
    const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
