import { Body, Controller, Post, Req } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';
import { MAGIC_LINK_ROUTES } from 'src/utils/constants/routes';
import { CreateMagicLinkDto, TokenDto } from './schema';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';
import { Request } from 'express';

@Controller(MAGIC_LINK_ROUTES.BASE)
export class MagicLinkAuthController {
  constructor(private readonly magicLinkAuthService: MagicLinkAuthService) {}

  @VerifyProject()
  @Post(MAGIC_LINK_ROUTES.SEND_MAGIC_LINK)
  async createMagicLink(@Body() body: CreateMagicLinkDto) {
    return this.magicLinkAuthService.createMagicLink(body);
  }

  @VerifyProject()
  @Post(MAGIC_LINK_ROUTES.VERIFY_MAGIC_LINK)
  async verifyMagicLink(@Req() request: Request, @Body() body: TokenDto) {
    return this.magicLinkAuthService.verifyMagicLink(body, request);
  }
}
