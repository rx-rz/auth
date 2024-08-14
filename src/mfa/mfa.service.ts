import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MfaRepository } from './mfa.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { EmailDto, VerifyMfaRegistrationDto } from './schema';

@Injectable()
export class MfaService {
  rpID = 'localhost';
  rpName = 'Rollo';
  origin = 'http://localhost:3001';
  constructor(
    private readonly mfaRepository: MfaRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async getAdminByEmail(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) throw new NotFoundException('Admin not found.');
    return admin;
  }

  async getAdminChallenge(adminId: string) {
    const challenge = await this.mfaRepository.getChallenge(adminId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async getAdminCredentials(id: string) {
    const credentials = await this.mfaRepository.getCredentials(id);
    if (!credentials) throw new NotFoundException('No MFA Credentials found for admin');
    return credentials;
  }

  async generateMfaRegistrationOptions({ email }: EmailDto) {
    const admin = await this.getAdminByEmail(email);
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpID: this.rpID,
      rpName: this.rpName,
      userName: `${admin.firstName} ${admin.lastName}`,
      attestationType: 'direct',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: [],
      supportedAlgorithmIDs: [-7, -257],
      timeout: 3600,
    });
    await this.mfaRepository.createChallenge(options.challenge, admin.id);
    return { success: true, options };
  }

  async verifyMfaRegistrationOptions(dto: VerifyMfaRegistrationDto) {
    const { email, options } = dto;
    const admin = await this.getAdminByEmail(email);
    const challengeBody = await this.getAdminChallenge(admin.id);

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: options as unknown as RegistrationResponseJSON,
      expectedChallenge: challengeBody.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: true,
    });
    if (!verified) throw new BadRequestException('Verification invalid');
    await Promise.all([
      this.mfaRepository.setCredentials({
        admin: {
          connect: {
            id: admin.id,
          },
        },
        deviceType: registrationInfo?.credentialDeviceType ?? '',
        publicKey: Buffer.from(
          registrationInfo?.credentialPublicKey!,
          registrationInfo?.credentialPublicKey.byteOffset,
          registrationInfo?.credentialPublicKey.byteLength,
        ),
        webauthnUserId: dto.webAuthnUserId,
        backedUp: registrationInfo?.credentialBackedUp,
        counter: registrationInfo?.counter,
        transports: dto.options.response.transports,
      }),
      this.mfaRepository.deleteChallenge(admin.id),
      this.adminRepository.updateAdmin(email, { mfaEnabled: true }),
    ]);

    return { success: true, message: 'Verification successful' };
  }

  async generateMfaAuthenticationOptions({ email }: EmailDto) {
    const admin = await this.getAdminByEmail(email);
    const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: [],
    });
    await this.mfaRepository.createChallenge(options.challenge, admin.id);
    return { success: true, options };
  }

  async verifyMfaAuthenticationOptions({ email }: EmailDto) {
    const admin = await this.getAdminByEmail(email);
    const challengeBody = await this.getAdminChallenge(admin.id);
    const credentials = await this.getAdminCredentials(admin.id);
    // const verification = await verifyAuthenticationResponse({
    //   response: challengeBody as any,
    //   expectedChallenge: challengeBody.challenge,
    //   expectedOrigin: this.origin,
    //   expectedRPID: this.rpID,
    //   authenticator: {
    //     counter: credentials.map((credential) => credential.)
    //   }
    // })
    // const {} = await verifyAuthenticationResponse({
    //   response:
    // })
  }
}
