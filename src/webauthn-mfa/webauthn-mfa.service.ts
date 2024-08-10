import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class WebauthnMfaService {
  base64urlEncode(buffer: Uint8Array): string {
    const encodedString = Buffer.from(buffer).toString('base64url');
    return encodedString;
  }

  async getChallenge() {
    // the challenge is a nonce (number / string that occurs only once)
    // it must be truly random and base64 url encoded
    const array = new Uint8Array(32);
    const randomCryptographicKey = this.base64urlEncode(crypto.getRandomValues(array));
    return { success: true, challenge: randomCryptographicKey };
  }

  async testGetAgain() {}
}
