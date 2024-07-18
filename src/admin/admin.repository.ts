import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Admin, Prisma } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async createAdmin(admin: Prisma.AdminCreateInput) {
    return this.prisma.admin.create({
      data: admin,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        mfaEnabled: true,
      },
    });
  }

  async getAdminByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }
}
