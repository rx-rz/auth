import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AdminRepository } from 'src/admin/admin.repository';
import { VerifyChallengeDto } from './schema';
@Injectable()
export class WebauthnMfaService {
  constructor(private readonly adminRepository: AdminRepository) {}

  private async getAdminByEmail(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) throw new NotFoundException('Admin not found.');
    return admin;
  }

  base64urlEncode(buffer: Uint8Array): string {
    const encodedString = Buffer.from(buffer).toString('base64url');
    return encodedString;
  }

  async getChallenge() {
    // the challenge is a nonce (number / string that occurs only once)
    // it must be truly random and base64 url encoded
    const array = new Uint8Array(32);
    const nonce = this.base64urlEncode(crypto.getRandomValues(array));
    console.log(nonce);
    return { success: true, challenge: nonce };
  }
  async verifyChallenge(body: VerifyChallengeDto, challenge: string) {
    const expected = {
      //TODO: use redis for better challenge implementation;
      challenge,
      origin: 'http://localhost:3001',
    };
    const { server } = await import('@passwordless-id/webauthn');
    const registrationParsed = await server.verifyRegistration(body, expected);
    console.log(registrationParsed);
  }
}
