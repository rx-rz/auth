import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ProjectService } from 'src/project/project.service';

export const VerifyProject = Reflector.createDecorator();
// decorator meant to protect routes meant for users alone
// e.g update password
export const UserOnly = Reflector.createDecorator();

@Injectable()
export class ProjectVerificationInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService,
    private reflector: Reflector,
  ) {}

  decodeUserToken(token: string | undefined) {
    if (token) {
      const userToken: User = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return userToken;
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const verifyProject = this.reflector.get(VerifyProject, context.getHandler());
    if (!verifyProject) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const clientKey = request.headers['x-client-key'];
    const user = this.decodeUserToken(request.headers.authorization);

    // api key verification is meant for users who will access the endpoints
    // from an external app. admins will use MFA to authenticate requests in
    // the custom auth management app frontend.
    
    if (user && user.role === 'rollo-admin') {
      return next.handle();
    }
    if (!apiKey || !clientKey)
      throw new BadRequestException(
        'Project credentials not provided. Please provide both your client and API keys',
      );
    const { projectId } = await this.projectService.verifyProjectApiKeys({ apiKey, clientKey });
    if (!projectId) throw new BadRequestException('Invalid project credentials provided.');
    if (request.method !== 'GET') {
      request.body.projectId = projectId;
      request.query.projectId = projectId;
    } else {
      request.query.projectId = projectId;
    }
    return next.handle();
  }
}

type User = {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  role: 'rollo-admin' | 'user';
  mfaEnabled: boolean;
};
