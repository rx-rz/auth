import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async storeRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        ...data,
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

  async getRefreshTokens(args: Prisma.RefreshTokenFindManyArgs) {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      ...args,
    });
    return refreshTokens;
  }

  async getAdminRefreshTokens(email: string, args?: Prisma.RefreshTokenFindManyArgs) {
    const adminRefreshTokens = await this.prisma.refreshToken.findMany({
      ...args,
      include: { admin: { where: { email } } },
    });
    return adminRefreshTokens;
  }

  async getUserRefreshTokens(email: string, args?: Prisma.RefreshTokenFindManyArgs) {
    const userRefreshTokens = this.prisma.refreshToken.findMany({
      ...args,
      include: { user: { where: { email } } },
    });
    return userRefreshTokens;
  }

  async deleteAllRefreshTokensAssociatedToAdmin(email: string) {
    const deletedRefreshTokens = this.prisma.refreshToken.deleteMany({
      where: { admin: { email } },
    });
    return deletedRefreshTokens;
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
