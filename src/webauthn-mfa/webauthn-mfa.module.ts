import { Module } from '@nestjs/common';
import { WebauthnMfaService } from './webauthn-mfa.service';
import { WebauthnMfaController } from './webauthn-mfa.controller';
import { AdminRepository } from 'src/admin/admin.repository';

@Module({
  controllers: [WebauthnMfaController],
  providers: [WebauthnMfaService, AdminRepository],
})
export class WebauthnMfaModule {}
