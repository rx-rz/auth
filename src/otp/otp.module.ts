import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OTPRepository } from './otp.repository';
import { Mailer } from 'src/infra/mail/mail.service';
import { AdminService } from 'src/admin/admin.service';
import { UserService } from 'src/user/user.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { UserRepository } from 'src/user/user.repository';
import { LoginService } from 'src/login/login.service';
import { LoginRepository } from 'src/login/login.repository';

@Module({
  controllers: [OtpController],
  providers: [
    OtpService,
    OTPRepository,
    AdminService,
    AdminRepository,
    UserRepository,
    UserService,
    LoginService,
    LoginRepository,
    Mailer,
  ],
})
export class OtpModule {}
