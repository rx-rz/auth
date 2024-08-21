import { OAuthProviders, Prisma } from '@prisma/client';

export interface OAuthProviderData {
  id: string;
  name: OAuthProviders;
  clientId: string;
  clientSecret: string;
}

export abstract class OAuthProvider {
  constructor(protected readonly oauthProviderData: OAuthProviderData) {}
  abstract getName(): OAuthProviders;
  abstract getAuthorizationUrl(state: string): string;
  abstract getTokens(code: string): any;
  getClientId(): string {
    return this.oauthProviderData.clientId;
  }
  getClientSecret(): string {
    return this.oauthProviderData.clientSecret;
  }
  getTokenUrl() {
    return 'https://oauth2.googleapis.com/token';
  }

  getScopes() {
    return ['profile', 'email'];
  }
}
