import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { OAuthRepository } from './oauth.repository';
import { EncryptionService } from 'src/infra/encryption/encryption.service';
import { OAuthFactory } from './oauth.factory';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { LoginRepository } from 'src/login/login.repository';
import { LoginService } from 'src/login/login.service';

@Module({
  controllers: [OauthController],
  providers: [
    OauthService,
    OAuthRepository,
    EncryptionService,
    OAuthFactory,
    LoginRepository,
    LoginService,
    UserRepository,
    UserService,
  ],
})
export class OauthModule {}
