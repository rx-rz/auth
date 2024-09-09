import { Injectable } from '@nestjs/common';
import { Prisma, TokenState } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async storeAdminRefreshToken(data: Prisma.AdminRefreshTokenCreateInput) {
    await this.prisma.adminRefreshToken.create({ data });
  }

  async getAdminRefreshTokenByValue(token: string) {
    const refreshToken = await this.prisma.adminRefreshToken.findUnique({
      where: { token },
    });
    return refreshToken;
  }

  async deleteAllRefreshTokensAssociatedToAdmin(email: string) {
    const deletedRefreshTokens = this.prisma.adminRefreshToken.deleteMany({
      where: { admin: { email } },
    });
    return deletedRefreshTokens;
  }

  async storeRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    await this.prisma.refreshToken.create({ data });
  }

  async updateRefreshTokenStatus(id: string, status: TokenState) {
    const refreshToken = await this.prisma.refreshToken.update({
      where: { id },
      data: {
        state: status,
      },
    });
    return refreshToken;
  }

  async getRefreshToken(id: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id },
    });
    return refreshToken;
  }

  async getRefreshTokenByTokenValue(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: {
        token: true,
        expiresAt: true,
        state: true,
        authMethod: true,
      },
    });
    return refreshToken;
  }

  async getRefreshTokens(args: Prisma.RefreshTokenFindManyArgs) {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      ...args,
    });
    return refreshTokens;
  }

  async getUserRefreshTokens(email: string, args?: Prisma.RefreshTokenFindManyArgs) {
    const userRefreshTokens = this.prisma.refreshToken.findMany({
      ...args,
      include: { user: { where: { email } } },
    });
    return userRefreshTokens;
  }

  async deleteAllRefreshTokensAssociatedToUser(email: string) {
    const deletedRefreshTokens = this.prisma.refreshToken.deleteMany({
      where: { user: { email } },
    });
    return deletedRefreshTokens;
  }

  async deleteRefreshToken(id: string) {
    const deletedRefreshToken = this.prisma.refreshToken.delete({
      where: { id },
    });
    return deletedRefreshToken;
  }
}
