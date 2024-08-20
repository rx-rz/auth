import { OAuthProviders } from "@prisma/client";

export interface OAuthProviderData {
  id: string;
  name: OAuthProviders;
  clientId: string;
  clientSecret: string;
}

abstract class OAuthProvider {
  abstract getName(): string;
  abstract getAuthorizationUrl(): string;
  abstract getTokenUrl(): string;
  abstract getClientId(): string;
  abstract getClientSecret(): string;
  abstract getScopes(): string[];
}
