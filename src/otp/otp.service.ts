import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { OTPRepository } from './otp.repository';
import { CreateOtpDto } from './dtos/create-otp-dto';
import { generateOtp } from 'src/utils/helper-functions/generate-otp';
import { VerifyOtpDto } from './dtos/verify-otp-dto';

@Injectable()
export class OtpService {
  constructor(private readonly otpRepository: OTPRepository) {}

  private async checkIfUserHasOtpInstanceInDB(email: string) {
    const otp = await this.otpRepository.getOTPDetails(email);
    if (!otp) {
      throw new NotFoundException('OTP not found.');
    }
    return otp;
  }

  async sendOTP(data: CreateOtpDto) {
    const code = generateOtp();
    const otpExists = await this.otpRepository.getOTPDetails(data.email);
    let otpDetails;
    if (otpExists) {
      otpDetails = await this.otpRepository.updateOTP(data.email, code);
    } else {
      otpDetails = await this.otpRepository.createOTP({
        ...data,
        code: code.toString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    }
    return otpDetails;
  }

  async verifyOTP(data: VerifyOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(data.email);
    if (otpDetails.expiresAt < new Date()) {
      throw new GoneException('Provided OTP has expired.');
    } else {
      return true;
    }
  }
}
