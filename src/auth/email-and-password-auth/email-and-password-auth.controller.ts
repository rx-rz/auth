import { Controller } from '@nestjs/common';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';

@Controller('email-and-password-auth')
export class EmailAndPasswordAuthController {
  constructor(
    private readonly emailAndPasswordAuthService: EmailAndPasswordAuthService,
  ) {}
}
