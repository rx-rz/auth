import { Body, Controller, Get, Post, Query, Req, UsePipes } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MFA_ROUTES } from 'src/utils/constants/routes';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import {
  EmailDto,
  EmailSchema,
  VerifyMfaRegistrationDto,
  VerifyMfaRegistrationSchema,
} from './schema';
import { Response } from 'express';

@Controller(MFA_ROUTES.BASE)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get(MFA_ROUTES.GET_REGISTRATION_OPTIONS)
  @UsePipes(new ZodPipe(EmailSchema))
  async getRegistrationOptions(@Req() response: Response, @Query() query: EmailDto) {
    return this.mfaService.generateMfaRegistrationOptions(query);
  }

  @Post(MFA_ROUTES.VERIFY_REGISTRATION_OPTIONS)
  @UsePipes(new ZodPipe(VerifyMfaRegistrationSchema))
  async verifyRegistrationOptiosn(@Body() body: VerifyMfaRegistrationDto) {
    console.log({ body });
    return this.mfaService.verifyMfaRegistrationOptions(body);
  }
}
