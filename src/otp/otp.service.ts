import { Injectable } from '@nestjs/common';
import { OTPRepository } from './otp.repository';
import { CreateOtpDto } from './dtos/create-otp-dto';
import { generateOtp } from 'src/utils/helper-functions/generate-otp';

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OTPRepository) {}

  async sendOTP(data: CreateOtpDto) {
    const otpNo = generateOtp();
    const otp = await this.otpRepository.createOTP({
      ...data,
      code: otpNo.toString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return otp;
  }
}
