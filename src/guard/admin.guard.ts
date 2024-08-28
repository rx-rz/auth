import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type User = {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  role: 'admin' | string;
  mfaEnabled: boolean;
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookies(request);
    console.log({ token });
    if (!token) {
      throw new UnauthorizedException('Invalid token provided.');
    }
    try {
      const payload: User = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      if (payload && payload.role !== 'admin') {
        throw new ForbiddenException('Admin access required.');
      }
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid token provided.');
    }
    return true;
  }

  private extractTokenFromCookies(request: any): string | undefined {
    console.log(request.cookies);
    const [type, token] = request.cookies.accessToken?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
