import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class WebauthnMfaService {
  private createChallenge(bytes = 32) {
    const buffer = randomBytes(bytes);
    const challenge = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return challenge;
  }

  challenge = this.createChallenge();
}
