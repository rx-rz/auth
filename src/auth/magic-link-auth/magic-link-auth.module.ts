import { Module } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';
import { MagicLinkAuthController } from './magic-link-auth.controller';
import { ProjectRepository } from 'src/project/project.repository';
import { UserRepository } from 'src/user/user.repository';
import { Mailer } from 'src/infra/mail/mail.service';
@Module({
  controllers: [MagicLinkAuthController],
  providers: [MagicLinkAuthService, ProjectRepository, UserRepository, Mailer],
})
export class MagicLinkAuthModule {}
