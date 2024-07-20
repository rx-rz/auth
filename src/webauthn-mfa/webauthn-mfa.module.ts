import { Module } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';
import { WebauthnMfaController } from './webauthn-mfa.controller';

@Module({
  controllers: [WebauthnMfaController],
  providers: [WebauthnMfaService],
})
export class WebauthnMfaModule {}
