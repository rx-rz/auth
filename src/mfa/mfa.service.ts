import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MfaRepository } from './mfa.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import {
  AuthenticationResponseJSON,
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
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  EmailDto,
  VerifyMfaAuthenticationDto,
  VerifyMfaRegistrationDto,
} from './schema';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class MfaService {
  rpID = 'localhost';
  rpName = 'Rollo';
  origin = 'http://localhost:3001';
  constructor(
    private readonly mfaRepository: MfaRepository,
    private readonly adminService: AdminService,
  ) {}

  async getAdminChallenge(adminId: string) {
    const challenge = await this.mfaRepository.getChallenge(adminId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async getAdminCredentials(id: string) {
    const credentials = await this.mfaRepository.getCredentials(id);
    if (!credentials)
      throw new NotFoundException('No MFA Credentials found for admin');
    return credentials;
  }

  async generateMfaRegistrationOptions({ email }: EmailDto) {
    const admin = await this.adminService.checkIfAdminExists({ email });
    const options: PublicKeyCredentialCreationOptionsJSON =
      await generateRegistrationOptions({
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
    const { email, webAuthnUserId, options } = dto;
    const admin = await this.adminService.checkIfAdminExists({ email });
    const { challenge } = await this.getAdminChallenge(admin.id);

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: options as RegistrationResponseJSON,
      expectedChallenge: challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: true,
    });
    if (!verified) throw new BadRequestException('Verification failed.');
    if (!registrationInfo)
      throw new BadRequestException('Verification failed.');
    const {
      credentialDeviceType,
      credentialPublicKey,
      credentialBackedUp,
      counter,
      credentialID,
    } = registrationInfo;
    await Promise.all([
      this.mfaRepository.setCredentials({
        admin: {
          connect: {
            id: admin.id,
          },
        },
        deviceType: credentialDeviceType ?? '',
        publicKey: Buffer.from(
          credentialPublicKey!,
          credentialPublicKey.byteOffset,
          credentialPublicKey.byteLength,
        ),
        webauthnUserId: webAuthnUserId,
        backedUp: credentialBackedUp,
        counter: counter,
        transports: options.response.transports,
        credentialId: credentialID ?? '',
      }),
      this.mfaRepository.deleteChallenge(admin.id),
      this.adminService.updateAdmin({
        email,
        mfaEnabled: true,
      }),
    ]);
    return { success: true, message: 'Verification successful' };
  }

  async generateMfaAuthenticationOptions({ email }: EmailDto) {
    const admin = await this.adminService.checkIfAdminExists({ email });
    const options: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID: this.rpID,
        allowCredentials: [],
      });
    await this.mfaRepository.createChallenge(options.challenge, admin.id);
    return { success: true, options };
  }

  async verifyMfaAuthenticationOptions({
    email,
    ...options
  }: VerifyMfaAuthenticationDto) {
    const admin = await this.adminService.checkIfAdminExists({ email });
    const { challenge } = await this.getAdminChallenge(admin.id);
    const credentials = (await this.getAdminCredentials(admin.id)).find(
      (credential) => credential.webauthnUserId === options.response.userHandle,
    );
    if (!credentials) throw new NotFoundException('Credentials not found');
    const { verified } = await verifyAuthenticationResponse({
      response: options as AuthenticationResponseJSON,
      expectedChallenge: challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      authenticator: {
        counter: Number(credentials.counter),
        credentialID: isoBase64URL.fromUTF8String(credentials.credentialId),
        credentialPublicKey: new Uint8Array(
          credentials.publicKey.buffer,
          credentials.publicKey.byteOffset,
          credentials.publicKey.byteLength,
        ),
        transports: credentials.transports as AuthenticatorTransportFuture[],
      },
    });
    if (!verified) throw new BadRequestException('Verification failed');
    return { success: true, message: 'User verified successfully' };
  }
}
