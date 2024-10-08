import { Body, Controller, Get, Post, Query, Req, UsePipes } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MFA_ROUTES } from 'src/utils/constants/routes';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import {
  EmailDto,
  EmailSchema,
  VerifyMfaAuthenticationDto,
  VerifyMfaAuthenticationSchema,
  VerifyMfaRegistrationDto,
  VerifyMfaRegistrationSchema,
} from './schema';

@Controller(MFA_ROUTES.BASE)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get(MFA_ROUTES.GET_REGISTRATION_OPTIONS)
  @UsePipes(new ZodPipe(EmailSchema))
  async getRegistrationOptions(@Query() query: EmailDto) {
    return this.mfaService.generateMfaRegistrationOptions(query);
  }

  @Post(MFA_ROUTES.VERIFY_REGISTRATION_OPTIONS)
  @UsePipes(new ZodPipe(VerifyMfaRegistrationSchema))
  async verifyRegistrationOptiosn(@Body() body: VerifyMfaRegistrationDto) {
    return this.mfaService.verifyMfaRegistrationOptions(body);
  }

  @Get(MFA_ROUTES.GET_AUTHENTICATION_OPTIONS)
  @UsePipes(new ZodPipe(EmailSchema))
  async getAuthenticationOptions(@Query() query: EmailDto) {
    return this.mfaService.generateMfaAuthenticationOptions(query);
  }

  @Post(MFA_ROUTES.VERIFY_AUTHENTICATION_OPTIONS)
  @UsePipes(new ZodPipe(VerifyMfaAuthenticationSchema))
  async verifyAuthenticationOptions(@Body() body: VerifyMfaAuthenticationDto) {
    return this.mfaService.verifyMfaAuthenticationOptions(body);
  }
}
