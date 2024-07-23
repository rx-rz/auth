import { Module } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [EmailAndPasswordAuthController],
  providers: [EmailAndPasswordAuthService, UserRepository],
})
export class EmailAndPasswordAuthModule {}
