import { OAuthProviders, Prisma } from '@prisma/client';
import { OAuthProvider, OAuthProviderData } from './oauth.provider';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleOauthProvider extends OAuthProvider {
  constructor(oauthProviderData: OAuthProviderData) {
    super(oauthProviderData);
  }

  getName(): OAuthProviders {
    return OAuthProviders.GOOGLE;
  }

  getID() {
    return this.oauthProviderData.id;
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      state,
      client_id: this.getClientId(),
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? '',
      scope: this.getScopes().join(' '),
      response_type: 'code',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getTokens(code: string) {
    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
        grant_type: 'authorization_code',
      }).toString(),
    });
    console.log(response.json());
    return response.json();
  }

  async getUserInfo(accessToken: string) {
    const { json } = await fetch(this.getUserInfoUrl(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(json);
    return json;
  }
}
