import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import {
  AdminEmailDto,
  AdminIdDto,
  GetAdminProjectDto,
  UpdateAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
} from './schema';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  adminReturnObject = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    isVerified: true,
    mfaEnabled: true,
  };

  async createAdmin(data: Prisma.AdminCreateInput) {
    const admin = await this.prisma.admin.create({
      data,
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminByEmail({ email }: AdminEmailDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminByID({ adminId }: AdminIdDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminPassword({ email }: AdminEmailDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    return admin?.password || '';
  }

  async updateAdmin({ email, ...data }: UpdateAdminDto) {
    const admin = await this.prisma.admin.update({
      where: { email },
      data,
      select: this.adminReturnObject,
    });
    return admin;
  }

  async updateAdminEmail({
    currentEmail,
    newEmail,
  }: Omit<UpdateAdminEmailDto, 'password'>) {
    const admin = await this.prisma.admin.update({
      where: { email: currentEmail },
      data: { email: newEmail },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async updateAdminPassword({
    email,
    newPassword,
  }: Omit<UpdateAdminPasswordDto, 'currentPassword'>) {
    const admin = await this.prisma.admin.update({
      where: { email },
      data: { password: newPassword },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminProjects({ email }: AdminEmailDto) {
    const adminProjects = await this.prisma.project.findMany({
      where: {
        admin: {
          email,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    return adminProjects;
  }

  async getAdminWebAuthnCredentials({ email }: AdminEmailDto) {
    const credentials = await this.prisma.webAuthnCredential.findMany({
      where: {
        admin: { email },
      },
    });
    return credentials;
  }

  async getAdminProjectByName({ adminId, name }: GetAdminProjectDto) {
    const adminProject = await this.prisma.project.findUnique({
      where: {
        project_name_admin_id_unique: {
          name,
          adminId,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        logins: true,
        refreshTokens: true,
      },
    });
    return adminProject;
  }

  async deleteAdmin({ email }: AdminEmailDto) {
    const admin = await this.prisma.admin.delete({
      where: { email },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async updatePasswordResetTokens({
    token,
    tokenExpiration,
    email,
  }: {
    token: string;
    tokenExpiration: Date;
    email: string;
  }) {
    const admin = await this.prisma.admin.update({
      data: {
        resetToken: token,
        resetTokenExpiration: tokenExpiration,
      },
      where: { email },
    });
    return admin;
  }

  async getAdminPasswordResetTokens({ email }: { email: string }) {
    const tokens = await this.prisma.admin.findUnique({
      where: { email },
      select: { resetToken: true, resetTokenExpiration: true },
    });
    return tokens
  }
  async getAdminRefreshTokens({ adminId }: AdminIdDto) {
    const refreshTokens = await this.prisma.adminRefreshToken.findMany({
      where: { adminId },
      select: { token: true, adminId: true, expiresAt: true, createdAt: true },
    });
    return refreshTokens;
  }
}
