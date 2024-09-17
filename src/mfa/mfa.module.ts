import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { MfaRepository } from './mfa.repository';
import { AdminService } from 'src/admin/admin.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { LoginService } from 'src/login/login.service';
import { LoginRepository } from 'src/login/login.repository';
import { Mailer } from 'src/infra/mail/mail.service';

@Module({
  controllers: [MfaController],
  providers: [
    MfaService,
    MfaRepository,
    AdminService,
    AdminRepository,
    LoginService,
    Mailer,
    LoginRepository,
  ],
})
export class MfaModule {}
