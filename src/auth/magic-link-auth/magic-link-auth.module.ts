import { Module } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';
import { MagicLinkAuthController } from './magic-link-auth.controller';
import { ProjectRepository } from 'src/project/project.repository';
import { UserRepository } from 'src/user/user.repository';
import { Mailer } from 'src/infra/mail/mail.service';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { LoginRepository } from 'src/login/login.repository';
@Module({
  controllers: [MagicLinkAuthController],
  providers: [
    MagicLinkAuthService,
    UserRepository,
    Mailer,
    AppEventEmitter,
    LoginRepository,
  ],
})
export class MagicLinkAuthModule {}
