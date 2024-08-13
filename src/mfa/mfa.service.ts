import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MfaRepository } from './mfa.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
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

  async checkIfChallengeExists(adminId: string) {
    const challenge = await this.mfaRepository.getChallenge(adminId);
    return challenge;
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
    const challengeBody = await this.mfaRepository.getChallenge(admin.id);
    if (!challengeBody) throw new NotFoundException('Challenge not found');

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
    ]);

    return { success: true, message: 'Verification successful' };
  }

  async generateMfaAuthenticationOptions({ email }: EmailDto) {
    const credentials = await this.mfaRepository.getCredentials(email);

    // const options: PublicKeyCredentialCreationOptionsJSON = await generateAuthenticationOptions({
    //   rpID: this.rpID,
    //   allowCredentials: credentials.map((credential) => ({
    //     id: credential.id,
    //     transports: credential.transports as AuthenticatorTransportFuture[],
    //   })),
    // });
    // await this.mfaRepository.createChallenge();
  }

  async verifyMfaAuthenticationOptions() {
    // const {} = await verifyAuthenticationResponse({
    //   response:
    // })
  }
}
