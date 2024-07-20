import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './infra/db/database.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebauthnMfaModule } from './webauthn-mfa/webauthn-mfa.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AdminModule,
    OtpModule,
    DatabaseModule,
    RefreshTokenModule,
    EventEmitterModule.forRoot(),
    WebauthnMfaModule,
  ],
})
export class AppModule {}
