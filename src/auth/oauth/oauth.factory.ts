import { Injectable } from '@nestjs/common';
import { GoogleOauthProvider } from './providers/google-oauth.provider';
import { OAuthProviderData } from './providers/oauth.provider';
import { GithubOauthProvider } from './providers/github-oauth.provider';

@Injectable()
export class OAuthFactory {
  createProvider(providerData: OAuthProviderData) {
    switch (providerData.name) {
      case 'GOOGLE':
        return new GoogleOauthProvider(providerData);
      case 'GITHUB':
        return new GithubOauthProvider(providerData);
      default:
        throw new Error(`Unsupported OAuth Provider: ${providerData.name}`);
    }
  }
}
