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
  abstract getUserInfo(accessToken: string): any;
  getClientId(): string {
    return this.oauthProviderData.clientId;
  }
  getClientSecret(): string {
    return this.oauthProviderData.clientSecret;
  }
  getTokenUrl() {
    return 'https://oauth2.googleapis.com/token';
  }
  getUserInfoUrl() {
    return 'https://www.googleapis.com/oauth2/v2/userinfo';
  }
  getScopes() {
    return ['profile', 'email'];
  }
}
