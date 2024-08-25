import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { OAuthRepository } from './oauth.repository';
import { EncryptionService } from 'src/infra/encryption/encryption.service';
import { ProjectRepository } from 'src/project/project.repository';
import { OAuthFactory } from './oauth.factory';

@Module({
  controllers: [OauthController],
  providers: [OauthService, OAuthRepository, EncryptionService, ProjectRepository, OAuthFactory],
})
export class OauthModule {}
