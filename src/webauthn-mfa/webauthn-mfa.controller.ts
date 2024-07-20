import { Controller } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';

@Controller('webauthn-mfa')
export class WebauthnMfaController {
  constructor(private readonly webauthnMfaService: WebauthnMfaService) {}
}
