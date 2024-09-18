import { OAuthProviders } from '@prisma/client';
import { OAuthProvider, OAuthProviderData } from './oauth.provider';
import { InternalServerErrorException } from '@nestjs/common';

type GitHubOauthTokenResponse = {
  access_token: string;
  token_type: 'bearer';
  scope: string;
};

export class GitHubOauthUserInfo {
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
  name: string;
  email: string;
}

export class GithubOauthProvider extends OAuthProvider {
  constructor(oauthProviderData: OAuthProviderData) {
    super(oauthProviderData);
  }

  getName(): OAuthProviders {
    return OAuthProviders.GITHUB;
  }

  getScopes(): string[] {
    return ['user:email'];
  }

  getUserInfoUrl(): string {
    return 'https://api.github.com/user';
  }

  getTokenUrl(): string {
    return 'https://github.com/login/oauth/access_token';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      state,
      client_id: this.getClientId(),
      redirect_uri: this.getRedirectUri() ?? '',
      scope: this.getScopes().join(' '),
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getTokens(code: string) {
    const response = await fetch(this.getTokenUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
        redirect_uri: this.getRedirectUri() ?? '',
      }),
    });
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Error response: ${response.status}, ${await response.text()}`,
      );
    }
    const data: GitHubOauthTokenResponse = await response.json();
    return data;
  }

  async getUserInfo(accessToken: string) {
    const response = await fetch(this.getUserInfoUrl(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Error response: ${response.status}, ${await response.text()}`,
      );
    }
    const data = await response.json();
    const user = new GitHubOauthUserInfo(data.name, data.email);
    return user;
  }
}
