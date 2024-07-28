import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Invalid token provided.');
    }
    try {
      const payload: User = await this.jwtService.verifyAsync(token);
      if (payload && payload.role !== 'admin') {
        throw new ForbiddenException('Admin access required.');
      }
    } catch {
      throw new UnauthorizedException('Invalid token provided.');
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}