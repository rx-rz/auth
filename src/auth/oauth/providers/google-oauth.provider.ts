import { OAuthProviders } from '@prisma/client';
import { OAuthProvider, OAuthProviderData } from './oauth.provider';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

type GoogleOauthTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  id_token: string;
  scope: string;
};

type GoogleOauthUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
};

@Injectable()
export class GoogleOauthProvider extends OAuthProvider {
  constructor(oauthProviderData: OAuthProviderData) {
    super(oauthProviderData);
  }

  getName(): OAuthProviders {
    return OAuthProviders.GOOGLE;
  }

  getScopes(): string[] {
    return ['profile', 'email'];
  }

  getUserInfoUrl(): string {
    return 'https://www.googleapis.com/oauth2/v2/userinfo';
  }

  getTokenUrl(): string {
    return 'https://oauth2.googleapis.com/token';
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
        redirect_uri: this.getRedirectUri() ?? '',
      }).toString(),
    });
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Error response: ' ${response.status}, ${await response.text()}`,
      );
    }
    const data: GoogleOauthTokenResponse = await response.json();
    return data;
  }

  async getUserInfo(accessToken: string) {
    const response = await fetch(this.getUserInfoUrl(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data: GoogleOauthUserInfo = await response.json();
    return data;
  }
}
