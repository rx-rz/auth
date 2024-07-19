import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async createAdmin(admin: Prisma.AdminCreateInput) {
    const createdAdmin = await this.prisma.admin.create({
      data: admin,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        mfaEnabled: true,
      },
    });
    return createdAdmin;
  }

  async getAdminByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        mfaEnabled: true,
      },
    });
    return admin;
  }

  async updateAdmin(email: string, data: Prisma.AdminUpdateInput) {
    const updatedAdmin = await this.prisma.admin.update({
      where: { email },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        mfaEnabled: true,
      },
    });
    return updatedAdmin;
  }

  async getAdminPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    return admin?.password;
  }
}
