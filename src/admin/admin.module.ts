import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { LoginService } from 'src/login/login.service';
import { LoginRepository } from 'src/login/login.repository';
import { Mailer } from 'src/infra/mail/mail.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, LoginService, LoginRepository, AdminRepository, Mailer],
})
export class AdminModule {}
