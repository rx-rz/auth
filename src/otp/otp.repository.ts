import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

export class OTPRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOTP(data: Prisma.OtpCreateInput) {
    return this.prisma.otp.create({
      data,
    });
  }
}
