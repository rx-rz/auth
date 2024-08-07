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

@Injectable()
export class ProjectVerificationInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const verifyProject = this.reflector.get(VerifyProject, context.getHandler());

    if (!verifyProject) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const clientKey = request.headers['x-client-key'];
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
