import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OTPRepository } from './otp.repository';

@Module({
  controllers: [OtpController],
  providers: [OtpService, OTPRepository],
})
export class OtpModule {}
