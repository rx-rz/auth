import { Controller, Get, Res } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';
import { client, server } from '@passwordless-id/webauthn';
import { MFA_ROUTES } from 'src/utils/constants/routes';
import { Response } from 'express';

@Controller(MFA_ROUTES.BASE)
export class WebauthnMfaController {
  constructor(private readonly webauthnMfaService: WebauthnMfaService) {}

  @Get(MFA_ROUTES.GET_CHALLENGE)
  async getChallenge(@Res({ passthrough: true }) response: Response) {
    const { challenge, success } = await this.webauthnMfaService.getChallenge();
    return { challenge };
  }

  @Get('challenge')
  async testChallenge() {
    return this.webauthnMfaService.testGetAgain();
  }
}
