import { Module } from '@nestjs/common';
import { Mailer } from './mail.service';

@Module({
  imports: [],
  providers: [Mailer],
  exports: [Mailer],
})
export class MailerModule {}
