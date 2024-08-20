import { Injectable } from '@nestjs/common';
import { OAuthProviders } from '@prisma/client';
import { OAuthRepository } from './oauth.repository';

@Injectable()
export class OauthService {
  constructor(private readonly oauthProviderRepository: OAuthRepository) {}
}
