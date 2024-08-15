import { stringify } from 'qs';
export class GoogleOauthStrategy extends OAuthStrategy {
  getAuthURL(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirectUri: this.redirectUri,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };
    return `${rootUrl}?${stringify(options)}`;
  }

  async getTokens(code: string): Promise<any> {
    const values = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
    };
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: stringify(values),
      });
      return response.json();
    } catch (err) {
      console.error('Failed to fetch auth token');
      throw new Error(err);
    }
  }

  async getUserInfo(tokens: any): Promise<any> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.id_token}`,
          },
        },
      );
      return response.json();
    } catch (error) {
      console.error('faied to fetch user');
      throw new Error(error);
    }
  }
}
