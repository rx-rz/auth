import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
  UsePipes,
} from '@nestjs/common';
import { OTPRepository } from './otp.repository';
import { generateOtp } from 'src/utils/helper-functions/generate-otp';
import { AdminRepository } from 'src/admin/admin.repository';
import { UserRepository } from 'src/user/user.repository';
import {
  CreateOtpDto,
  VerifyAdminOtpDto,
  CreateOtpSchema,
  VerifyAdminOtpSchema,
  VerifyOtpDto,
  VerifyOtpSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OTPRepository,
    private readonly adminRepository: AdminRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private async checkIfUserHasOtpInstanceInDB(email: string) {
    return await this.otpRepository.getOTPDetails(email);
  }


  async sendOTP(data: CreateOtpDto) {
    const code = generateOtp();
    let user;

    if (data.isAdmin) {
      user = await this.adminRepository.getAdminByEmail(data.email);
    } else {
      user = await this.userRepository.getUserByEmail(data.email);
    }
    if (!user) {
      throw new NotFoundException('User with provided details does not exist.');
    }
    const otpExists = await this.otpRepository.getOTPDetails(data.email);
    const otpDetails = otpExists
      ? await this.otpRepository.updateOTP(data.email, code)
      : await this.otpRepository.createOTP({
          email: data.email,
          code: code.toString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

    return otpDetails;
  }

  async verifyAdminOTP(data: VerifyAdminOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(data.email);
    if (!otpDetails) {
      throw new NotFoundException('An OTP has not been provided for this user');
    }
    const admin = await this.adminRepository.getAdminByEmail(data.email);
    if (!admin) {
      throw new NotFoundException('User with provided details does not exist.');
    }
    if (otpDetails.code !== data.code) {
      throw new BadRequestException('Invalid OTP provided.');
    }
    if (otpDetails.expiresAt < new Date()) {
      await this.otpRepository.deleteOTP(data.email);
      throw new GoneException('Provided OTP has expired.');
    }
    await Promise.all([
      this.adminRepository.updateAdmin(data.email, { isVerified: true }),
      this.otpRepository.deleteOTP(data.email),
    ]);
  }

  async verifyOTP({ code, email, projectId, userId }: VerifyOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(email);
    if (!otpDetails) {
      throw new NotFoundException(
        'An OTP has not been provided for this user.',
      );
    }
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User with provided details does not exist.');
    }
    if (otpDetails.code !== code) {
      throw new BadRequestException('Invalid OTP provided.');
    }
    if (otpDetails.expiresAt < new Date()) {
      await this.otpRepository.deleteOTP(email);
      throw new GoneException('Provided OTP has expired.');
    }
    await Promise.all([
      this.userRepository.updateUserDetails(userId, projectId, {
        isVerified: true,
      }),
      this.otpRepository.deleteOTP(email),
    ]);
    return { success: true, message: 'OTP verified successfully' };
  }
}
