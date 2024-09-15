import { OAuthProviders } from '@prisma/client';

export interface OAuthProviderData {
  id: string;
  name: OAuthProviders;
  clientId: string;
  clientSecret: string;
  projectId: string;
  redirectUri: string;
}

export abstract class OAuthProvider {
  constructor(protected readonly oauthProviderData: OAuthProviderData) {}
  abstract getName(): OAuthProviders;
  abstract getAuthorizationUrl(state: string): string;
  abstract getTokens(code: string): any;
  abstract getUserInfo(accessToken: string): any;
  abstract getTokenUrl(): string;
  abstract getUserInfoUrl(): string;
  abstract getScopes(): string[];

  getClientId(): string {
    return this.oauthProviderData.clientId;
  }

  getProviderId(): string {
    return this.oauthProviderData.id;
  }

  getClientSecret(): string {
    return this.oauthProviderData.clientSecret;
  }

  getRedirectUri(): string {
    return this.oauthProviderData.redirectUri;
  }
}
