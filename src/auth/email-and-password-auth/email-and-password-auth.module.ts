import { Module } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';
import { UserRepository } from 'src/user/user.repository';
import { LoginRepository } from 'src/login/login.repository';
@Module({
  controllers: [EmailAndPasswordAuthController],
  providers: [EmailAndPasswordAuthService, UserRepository, LoginRepository],
})
export class EmailAndPasswordAuthModule {}
