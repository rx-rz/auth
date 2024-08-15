import { Injectable } from '@nestjs/common';
import { OAuthStrategyFactory } from './oauth-factory/oauth-strategy.factory';
import { OAuthProviders } from '@prisma/client';

@Injectable()
export class OauthService {
  private strategy: OAuthStrategy;
  constructor(
    private readonly oauthFactory: OAuthStrategyFactory,
    private projectId: string,
    private providerName: OAuthProviders,
  ) {}
  async initialize(): Promise<void> {
    this.strategy = await this.oauthFactory.createStrategy(this.projectId, this.providerName, '');
  }
}
