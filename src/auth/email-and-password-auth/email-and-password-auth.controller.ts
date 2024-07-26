import { Body, Controller, Post } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { USER_ROUTES } from 'src/utils/constants/routes';
import { RegisterWithEmailAndPasswordDto } from './dtos/register-with-email-and-password-dto';
import { LoginWithEmailAndPasswordDto } from './dtos/login-with-email-and-password-dto';

@Controller(USER_ROUTES.BASE)
export class EmailAndPasswordAuthController {
  constructor(
    private readonly emailAndPasswordAuthService: EmailAndPasswordAuthService,
  ) {}

  @Post(USER_ROUTES.REGISTER_WITH_EMAIL_AND_PASSWORD)
  async registerWithEmailAndPassword(
    @Body() body: RegisterWithEmailAndPasswordDto,
  ) {
    return this.emailAndPasswordAuthService.registerWithEmailAndPassword(body);
  }

  @Post(USER_ROUTES.SIGNIN_WITH_EMAIL_AND_PASSWORD)
  async signInWithEmailAndPassword(@Body() body: LoginWithEmailAndPasswordDto) {
    return this.emailAndPasswordAuthService.loginWithEmailAndPassword(body,);
  }
}
