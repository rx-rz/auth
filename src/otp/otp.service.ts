import { BadRequestException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { OTPRepository } from './otp.repository';
import { generateOtp } from 'src/utils/helper-functions/generate-otp';
import { AdminRepository } from 'src/admin/admin.repository';
import { UserRepository } from 'src/user/user.repository';
import { CreateOtpDto, VerifyAdminOtpDto, VerifyOtpDto } from './schema';
import { Mailer } from 'src/infra/mail/mail.service';
import { SendEmailDto } from 'src/infra/mail/schema';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OTPRepository,
    private readonly adminRepository: AdminRepository,
    private readonly userRepository: UserRepository,
    private readonly mailer: Mailer,
  ) {}

  private async checkIfUserHasOtpInstanceInDB(email: string) {
    return await this.otpRepository.getOTPDetails(email);
  }

  async sendOTP(dto: CreateOtpDto) {
    const code = generateOtp();
    let user;

    if (dto.isAdmin) {
      user = await this.adminRepository.getAdminByEmail(dto.email);
    } else {
      user = await this.userRepository.getUserByEmail(dto.email);
    }
    if (!user) {
      throw new NotFoundException('User with provided details does not exist.');
    }
    const otpExists = await this.otpRepository.getOTPDetails(dto.email);
    const otpDetails = otpExists
      ? await this.otpRepository.updateOTP(dto.email, code)
      : await this.otpRepository.createOTP({
          email: dto.email,
          code: code.toString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
    const mailOptions: SendEmailDto = {
      recipients: ['adeleyetemiloluwa674@gmail.com'],
      subject: 'OTP',
      html: `<h1>Hello ${user.email},Your OTP is: <br/> <span style="font-size:60px;">${code}</span></h1><p>It expires in <span style="color:red;">10 minutes.</span></p>`,
      from: 'adeleyetemiloluwa.work@gmail.com',
    };
    const { error, response } = await this.mailer.sendEmail(mailOptions);
    if (error) throw error;
    return { success: true, otpDetails, mailError: error, mailResponse: response };
  }

  async verifyAdminOTP({ code, email }: VerifyAdminOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(email);
    if (!otpDetails) {
      throw new NotFoundException('An OTP has not been provided for this user');
    }
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
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
      this.adminRepository.updateAdmin(email, { isVerified: true }),
      this.otpRepository.deleteOTP(email),
    ]);

    return { success: true, message: 'OTP verified successfully' };
  }

  async verifyOTP({ code, email, projectId, userId }: VerifyOtpDto) {
    const otpDetails = await this.checkIfUserHasOtpInstanceInDB(email);
    if (!otpDetails) {
      throw new NotFoundException('An OTP has not been provided for this user.');
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
      this.userRepository.updateUserProjectDetails(userId, projectId, { isVerified: true }),
      this.otpRepository.deleteOTP(email),
    ]);
    return { success: true, message: 'OTP verified successfully' };
  }
}
