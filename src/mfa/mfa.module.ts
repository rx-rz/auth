import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { MfaRepository } from './mfa.repository';
import { AdminRepository } from 'src/admin/admin.repository';

@Module({
  controllers: [MfaController],
  providers: [MfaService, MfaRepository, AdminRepository],
})
export class MfaModule {}
