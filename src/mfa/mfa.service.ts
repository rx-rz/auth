import { Injectable, NotFoundException } from '@nestjs/common';
import { MfaRepository } from './mfa.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { generateRegistrationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { EmailDto } from './schema';

@Injectable()
export class MfaService {
  rpID = 'localhost';
  rpName = 'Rollo';
  origin = 'https://localhost:3001/mfa';
  constructor(
    private readonly mfaRepository: MfaRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAdminByEmail(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) throw new NotFoundException('Admin not found.');
    return admin;
  }

  async generateMfaRegistrationOptions({ email }: EmailDto) {
    const admin = await this.getAdminByEmail(email);
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpID: this.rpID,
      rpName: this.rpName,
      userName: `${admin.firstName} ${admin.lastName}`,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });
    console.log(options);
    await this.mfaRepository.createChallenge({
      admin: {
        connect: {
          email: admin.email,
        },
      },
      challenge: options.challenge,
    });
    return { success: true, options };
  }

  async verifyMfaRegistrationOptions(body: any) {
    const admin = await this.getAdminByEmail(body.email);
    const challengeBody = await this.mfaRepository.getChallenge(admin.id);
    if (!challengeBody) throw new NotFoundException('Challenge not found');
    const a = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengeBody.challenge,
      authenticator: body.authenticator,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });
  }
}
