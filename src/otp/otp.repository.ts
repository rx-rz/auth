import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class OTPRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOTP(data: Prisma.OtpCreateInput) {
    const otp = await this.prisma.otp.create({
      data,
    });
    return otp;
  }

  async getOTPDetails(email: string) {
    const otp = await this.prisma.otp.findUnique({
      where: { email },
    });
    return otp;
  }

  async updateOTP(email: string, code: number) {
    const otp = await this.prisma.otp.update({
      where: { email },
      data: { code: code.toString() },
    });
    return otp;
  }

  async deleteOTP(email: string) {
    const otp = await this.prisma.otp.delete({
      where: { email },
    });
    return otp;
  }
}
