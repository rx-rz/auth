import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';
import { MFA_ROUTES } from 'src/utils/constants/routes';
import { Request, Response } from 'express';
import { VerifyChallengeDto } from './schema';

@Controller(MFA_ROUTES.BASE)
export class WebauthnMfaController {
  constructor(private readonly webauthnMfaService: WebauthnMfaService) {}

  @Get(MFA_ROUTES.GET_CHALLENGE)
  async getChallenge() {
    const { challenge, success } = await this.webauthnMfaService.getChallenge();
    return { success, challenge };
  }

  @Post(MFA_ROUTES.VERIFY_CHALLENGE)
  async verifyChallenge(@Req() request: Request, @Body() body: VerifyChallengeDto) {
    const challenge = request.cookies.challenge;
    return this.webauthnMfaService.verifyChallenge(body, challenge);
  }
}
