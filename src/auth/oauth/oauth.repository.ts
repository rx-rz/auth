import { Injectable } from '@nestjs/common';
import { OAuthProviders, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class OAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addOauthProviderToProject(data: Prisma.OAuthProviderCreateInput) {
    const provider = await this.prisma.oAuthProvider.create({ data });
    return provider;
  }

  async getOauthProvider(providerId: string) {
    const provider = await this.prisma.oAuthProvider.findUnique({
      where: {
        id: providerId,
      },
      select: {
        name: true,
        id: true,
        clientId: true,
        redirectUri: true,
        clientSecret: true,
        projectId: true
      },
    });
    return provider;
  }

  async getOauthProviderForSpecificProject(name: OAuthProviders, projectId: string) {
    const provider = await this.prisma.oAuthProvider.findUnique({
      where: {
        name_projectId: {
          name,
          projectId,
        },
      },
    });
    return provider;
  }

  async deleteOauthProvider(id: string) {
    const provider = await this.prisma.oAuthProvider.delete({
      where: {
        id,
      },
    });
    return provider;
  }

  async createOauthState(data: Prisma.OAuthStateCreateInput) {
    const state = await this.prisma.oAuthState.create({ data });
    return state;
  }

  async deleteOauthState(id: string) {
    const state = await this.prisma.oAuthState.delete({ where: { id } });
    return state;
  }

  async getOauthState(id: string) {
    const state = await this.prisma.oAuthState.findUnique({ where: { id } });
    return state;
  }
}
