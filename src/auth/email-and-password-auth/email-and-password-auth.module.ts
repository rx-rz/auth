import { Module } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';
import { UserRepository } from 'src/user/user.repository';
import { LoginService } from 'src/login/login.service';
import { UserService } from 'src/user/user.service';
import { LoginRepository } from 'src/login/login.repository';
@Module({
  controllers: [EmailAndPasswordAuthController],
  providers: [
    EmailAndPasswordAuthService,
    UserService,
    UserRepository,
    LoginService,
    LoginRepository,
  ],
})
export class EmailAndPasswordAuthModule {}
