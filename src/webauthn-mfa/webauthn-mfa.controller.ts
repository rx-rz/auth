import { Controller, Get } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';
import { client, server } from '@passwordless-id/webauthn';
import { MFA_ROUTES } from 'src/utils/constants/routes';

@Controller(MFA_ROUTES.BASE)
export class WebauthnMfaController {
  constructor(private readonly webauthnMfaService: WebauthnMfaService) {}

  @Get(MFA_ROUTES.GET_CHALLENGE)
  async getChallenge() {
    return this.webauthnMfaService.getChallenge();
  }
}
