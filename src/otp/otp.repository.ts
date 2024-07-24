import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class OTPRepository {
  constructor(private readonly prisma: PrismaService) {}
  otpReturnObject = {
    code: true,
    email: true,
    expiresAt: true,
    createdAt: true,
  };

  async createOTP(data: Prisma.OtpCreateInput) {
    const otp = await this.prisma.otp.create({
      data,
      select: this.otpReturnObject,
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
      select: this.otpReturnObject,
    });
    return otp;
  }

  async deleteOTP(email: string) {
    const otp = await this.prisma.otp.delete({
      where: { email },
      select: this.otpReturnObject,
    });
    return otp;
  }
}
