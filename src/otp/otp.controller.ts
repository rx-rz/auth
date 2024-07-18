import { Body, Controller, Get, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OTP_ROUTES } from 'src/infra/constants/routes';
import { CreateOtpDto } from './dtos/create-otp-dto';
import { VerifyOtpDto } from './dtos/verify-otp-dto';

@Controller(OTP_ROUTES.BASE)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get(OTP_ROUTES.SEND)
  async sendOTP(@Body() data: CreateOtpDto) {
    return this.otpService.sendOTP(data);
  }

  @Post(OTP_ROUTES.VERIFY)
  async verifyOTP(@Body() data: VerifyOtpDto) {
    return this.otpService.verifyOTP(data);
  }
}
