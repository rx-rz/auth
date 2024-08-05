import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OTP_ROUTES } from 'src/utils/constants/routes';
import { CreateOtpDto, CreateOtpSchema, VerifyOtpDto, VerifyOtpSchema } from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';

@Controller(OTP_ROUTES.BASE)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post(OTP_ROUTES.SEND)
  @UsePipes(new ZodPipe(CreateOtpSchema))
  async sendOTP(@Body() data: CreateOtpDto) {
    return this.otpService.sendOTP(data);
  }

  @Post(OTP_ROUTES.VERIFY_ADMIN_OTP)
  @UsePipes(new ZodPipe(VerifyOtpSchema))
  async verifyAdminOtp(@Body() data: VerifyOtpDto) {
    return this.otpService.verifyOTP(data);
  }

  @VerifyProject()
  @Post(OTP_ROUTES.VERIFY)
  @UsePipes(new ZodPipe(VerifyOtpSchema))
  async verifyOTP(@Body() data: VerifyOtpDto) {
    return this.otpService.verifyOTP(data);
  }
}
