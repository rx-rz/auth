import { Module } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';
import { MagicLinkAuthController } from './magic-link-auth.controller';

@Module({
  controllers: [MagicLinkAuthController],
  providers: [MagicLinkAuthService],
})
export class MagicLinkAuthModule {}
