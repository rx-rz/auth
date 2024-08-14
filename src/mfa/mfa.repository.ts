import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class MfaRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getCredentials(id: string) {
    const credentials = await this.prisma.webAuthnCredential.findMany({
      where: { admin: { id } },
    });
    return credentials;
  }

  async setCredentials(data: Prisma.WebAuthnCredentialCreateInput) {
    const credentials = await this.prisma.webAuthnCredential.create({
      data,
    });
    return credentials;
  }

  async createChallenge(nonce: string, adminId: string) {
    const challenge = await this.prisma.challenge.upsert({
      create: {
        challenge: nonce,
        adminId,
      },
      update: {
        challenge: nonce,
      },
      where: {
        adminId,
      },
    });
    return challenge;
  }

  async getChallenge(adminId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { adminId },
    });
    return challenge;
  }

  async deleteChallenge(adminId: string) {
    const challenge = await this.prisma.challenge.delete({
      where: { adminId },
    });
    return challenge;
  }
}
