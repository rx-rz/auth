import { Module } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';

@Module({
  controllers: [EmailAndPasswordAuthController],
  providers: [EmailAndPasswordAuthService],
})
export class EmailAndPasswordAuthModule {}
