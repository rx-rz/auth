import { Controller } from '@nestjs/common';
import { MagicLinkAuthService } from './magic-link-auth.service';

@Controller('magic-link-auth')
export class MagicLinkAuthController {
  constructor(private readonly magicLinkAuthService: MagicLinkAuthService) {}
}
