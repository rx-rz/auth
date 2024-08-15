abstract class OAuthStrategy {
  constructor(
    protected clientId: string,
    protected clientSecret: string,
    protected redirectUri: string,
  ) {}

  abstract getAuthURL(): string;
  abstract getTokens(code: string): Promise<any>;
  abstract getUserInfo(tokens: any): Promise<any>;
}
