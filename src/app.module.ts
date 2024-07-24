import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './infra/db/database.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebauthnMfaModule } from './webauthn-mfa/webauthn-mfa.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CentralizedExceptionFilter } from './utils/exceptions/centralized-exception-filter';
import { OauthModule } from './auth/oauth/oauth.module';
import { MagicLinkAuthModule } from './auth/magic-link-auth/magic-link-auth.module';
import { EmailAndPasswordAuthModule } from './auth/email-and-password-auth/email-and-password-auth.module';
import { RoleBasedAccessControlModule } from './rbac/rbac.module';
import { ErrorEmitterService } from './utils/exceptions/emit-error-service';
import { EmitErrorInterceptor } from './utils/exceptions/emit-error-interceptor';
import { ErrorListenerService } from './utils/exceptions/error-listener-service';
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CentralizedExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EmitErrorInterceptor
    },
    ErrorListenerService,
    ErrorEmitterService,
  ],
  imports: [
    AdminModule,
    OtpModule,
    DatabaseModule,
    RefreshTokenModule,

    EventEmitterModule.forRoot({}),
    WebauthnMfaModule,
    ProjectModule,
    UserModule,
    EmailAndPasswordAuthModule,
    OauthModule,
    MagicLinkAuthModule,
    RoleBasedAccessControlModule,
  ],
})
export class AppModule {}
