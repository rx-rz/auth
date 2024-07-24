import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OTPRepository } from './otp.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [OtpController],
  providers: [OtpService, OTPRepository, AdminRepository, UserRepository],
})
export class OtpModule {}
