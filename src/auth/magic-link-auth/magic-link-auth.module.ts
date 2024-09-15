import { Module } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';
import { MagicLinkAuthController } from './magic-link-auth.controller';
import { UserRepository } from 'src/user/user.repository';
import { Mailer } from 'src/infra/mail/mail.service';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { LoginRepository } from 'src/login/login.repository';
import { UserService } from 'src/user/user.service';
import { LoginService } from 'src/login/login.service';
@Module({
  controllers: [MagicLinkAuthController],
  providers: [
    MagicLinkAuthService,
    UserRepository,
    Mailer,
    UserService,
    LoginService,
    AppEventEmitter,
    LoginRepository,
  ],
})
export class MagicLinkAuthModule {}
