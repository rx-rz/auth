import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './infra/db/database.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { WebauthnMfaModule } from './webauthn-mfa/webauthn-mfa.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CentralizedExceptionFilter } from './utils/exceptions/centralized-exception-filter';
import { OauthModule } from './auth/oauth/oauth.module';
import { MagicLinkAuthModule } from './auth/magic-link-auth/magic-link-auth.module';
import { EmailAndPasswordAuthModule } from './auth/email-and-password-auth/email-and-password-auth.module';
import { RoleBasedAccessControlModule } from './rbac/rbac.module';
import { AppEventEmitterModule } from './infra/emitter/app-event-emitter.module';
import { ClsModule } from 'nestjs-cls';
import { LoginModule } from './login/login.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProjectVerificationInterceptorModule } from './utils/interceptors/project-verification.module';
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CentralizedExceptionFilter,
    },
  ],
  imports: [
    AdminModule,
    OtpModule,
    DatabaseModule,
    RefreshTokenModule,
    WebauthnMfaModule,
    ProjectModule,
    UserModule,
    EmailAndPasswordAuthModule,
    OauthModule,
    MagicLinkAuthModule,
    RoleBasedAccessControlModule,
    ProjectVerificationInterceptorModule,
    AppEventEmitterModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env'],
      isGlobal: true,
    }),
    LoginModule,
  ],
})
export class AppModule {}
