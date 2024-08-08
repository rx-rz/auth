import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { USER_ROUTES } from 'src/utils/constants/routes';
import { Response } from 'express';
import {
  LoginWithEmailAndPasswordDto,
  LoginWithEmailAndPasswordSchema,
  RegisterWithEmailAndPasswordDto,
  RegisterWithEmailAndPasswordSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';

@Controller(USER_ROUTES.BASE)
export class EmailAndPasswordAuthController {
  constructor(private readonly emailAndPasswordAuthService: EmailAndPasswordAuthService) {}

  @Post(USER_ROUTES.REGISTER_WITH_EMAIL_AND_PASSWORD)
  @VerifyProject()
  @UsePipes(new ZodPipe(RegisterWithEmailAndPasswordSchema))
  async registerWithEmailAndPassword(@Body() body: RegisterWithEmailAndPasswordDto) {
    return this.emailAndPasswordAuthService.registerWithEmailAndPassword(body);
  }

  @Post(USER_ROUTES.SIGNIN_WITH_EMAIL_AND_PASSWORD)
  @VerifyProject()
  @UsePipes(new ZodPipe(LoginWithEmailAndPasswordSchema))
  async signInWithEmailAndPassword(
    @Body() body: LoginWithEmailAndPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, success } =
      await this.emailAndPasswordAuthService.loginWithEmailAndPassword(body);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, accessToken };
  }
}
