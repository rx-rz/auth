import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OTPRepository } from './otp.repository';
import { CreateOtpDto } from './dtos/create-otp-dto';
import { generateOtp } from 'src/utils/helper-functions/generate-otp';
import { VerifyOtpDto } from './dtos/verify-otp-dto';
import { AdminRepository } from 'src/admin/admin.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OTPRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  private async checkIfUserHasOtpInstanceInDB(email: string) {
    return await this.otpRepository.getOTPDetails(email);
  }

  async sendOTP(data: CreateOtpDto) {
    const code = generateOtp();
    let user;

    if (data.isAdmin) {
      user = await this.adminRepository.getAdminByEmail(data.email);
      if (!user) {
        throw new NotFoundException(
          'Admin with provided details does not exist.',
        );
      }
    }

    const otpExists = await this.otpRepository.getOTPDetails(data.email);
    const otpDetails = otpExists
      ? await this.otpRepository.updateOTP(data.email, code)
      : await this.otpRepository.createOTP({
          ...data,
          code: code.toString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

    return otpDetails;
  }

  async verifyOTP(data: VerifyOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(data.email);
    if (!otpDetails) {
      throw new NotFoundException(
        'An OTP has not been provided for this user.',
      );
    }

    if (data.isAdmin) {
      const user = await this.adminRepository.getAdminByEmail(data.email);
      if (!user) {
        throw new NotFoundException(
          'User with the provided details could not be found.',
        );
      }
    }

    if (otpDetails.code !== data.code) {
      throw new BadRequestException('Invalid OTP provided.');
    }

    if (otpDetails.expiresAt < new Date()) {
      await this.otpRepository.deleteOTP(data.email);
      throw new GoneException('Provided OTP has expired.');
    }
    data.isAdmin &&
      this.adminRepository.updateAdmin(data.email, { isVerified: true });
    await this.otpRepository.deleteOTP(data.email);
    return { success: true, message: 'OTP verified successfully' };
  }
}
