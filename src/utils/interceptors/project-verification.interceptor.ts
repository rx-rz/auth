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

export const SkipProjectVerification = Reflector.createDecorator<boolean>();

@Injectable()
export class ProjectVerificationInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const skipProjectVerification = this.reflector.get(
      SkipProjectVerification,
      context.getHandler(),
    );
    if (skipProjectVerification) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const clientKey = request.headers['x-client-key'];
    const projectId = request.headers['x-project-id'];
    if (!apiKey || !clientKey)
      throw new BadRequestException(
        'Project credentials not provided. Please provide both your client and API keys',
      );
    await this.projectService.verifyProjectApiKeys({ apiKey, clientKey });
    if (!projectId) throw new BadRequestException('Invalid project credentials provided.');
    if (request.method !== 'GET') {
      request.body = { ...request.body, projectId };
    }
    request.query.projectId = projectId;
    return next.handle();
  }
}
