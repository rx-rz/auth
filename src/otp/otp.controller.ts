import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OTP_ROUTES } from 'src/utils/constants/routes';
import {
  CreateOtpDto,
  CreateOtpSchema,
  VerifyAdminOtpDto,
  VerifyAdminOtpSchema,
  VerifyOtpDto,
  VerifyOtpSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';
import { randomBytes } from 'crypto';

@Controller(OTP_ROUTES.BASE)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post(OTP_ROUTES.SEND)
  @UsePipes(new ZodPipe(CreateOtpSchema))
  async sendOTP(@Body() body: CreateOtpDto) {
    return this.otpService.sendOTP(body);
  }

  @Post(OTP_ROUTES.VERIFY_ADMIN_OTP)
  @UsePipes(new ZodPipe(VerifyAdminOtpSchema))
  async verifyAdminOtp(@Body() body: VerifyAdminOtpDto) {
    return this.otpService.verifyAdminOTP(body);
  }

  @VerifyProject()
  @Post(OTP_ROUTES.VERIFY)
  @UsePipes(new ZodPipe(VerifyOtpSchema))
  async verifyOTP(@Body() body: VerifyOtpDto) {
    return this.otpService.verifyOTP(body);
  }
}
