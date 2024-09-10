import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';

type User = {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  isVerified: boolean;
  role: 'rollo-admin' | string;
  mfaEnabled: boolean;
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { token, refreshToken } = this.extractTokenFromCookies(request);

    try {
      const user = await this.getUserFromToken(token);
      if (user && user.role !== 'rollo-admin') {
        throw new ForbiddenException('Admin access required.');
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const expiredUser = this.jwtService.decode(token) as User;
        await this.checkRefreshTokenValidityAndGenerateNewOneIfRequired(
          refreshToken,
          expiredUser,
          response,
        );
      } else {
        throw new UnauthorizedException('Invalid token provided.');
      }
    }
    return true;
  }

  private extractTokenFromCookies(request: any) {
    const [type, token] = request.cookies.accessToken?.split(' ') ?? [];
    if (!token) {
      throw new UnauthorizedException('No token provided.');
    }
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token not provided');
    return { token: type === 'Bearer' ? token : undefined, refreshToken };
  }

  private async getUserFromToken(token: string) {
    const user: User = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN'),
    });
    return user;
  }

  private async checkRefreshTokenValidityAndGenerateNewOneIfRequired(
    refreshToken: string,
    user: User,
    response: any,
  ) {
    const token = await this.refreshTokenService.getRefreshTokenByTokenValue({
      token: refreshToken,
    });
    if (!token) throw new NotFoundException('Refresh token not found.');
    if (token && token.expiresAt < new Date()) {
      throw new HttpException('Refresh token expired', 301);
    }
    const payload = {
      email: user.email,
      firstName: user.firstName,
      isVerified: user.isVerified,
      lastName: user.lastName,
      id: user.id,
      role: 'rollo-admin',
      mfaEnabled: user.mfaEnabled,
    };
    const accessToken = await this.getAccessToken(payload);
    response.cookie('accessToken', `Bearer ${accessToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 60 * 1000,
    });
  }

  private async getAccessToken(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15h',
    });
    return accessToken;
  }
}
