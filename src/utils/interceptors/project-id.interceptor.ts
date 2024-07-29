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

export const SkipProjectId = () => Reflector.createDecorator<boolean>();

@Injectable()
export class ProjectIdInterceptor implements NestInterceptor {
  constructor(
    private projectService: ProjectService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    console.log('here');
    const skipProjectId = this.reflector.get(
      SkipProjectId,
      context.getHandler(),
    );
    if (skipProjectId) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey)
      throw new BadRequestException('Project credentials not provided');

    const projectApiKeyIsValid =
      await this.projectService.verifyProjectApiKey(apiKey);
    if (!projectApiKeyIsValid)
      throw new BadRequestException('Invalid project credentials provided.');
    const projectId = await this.projectService.getProjectIDByApiKey(apiKey);
    if (!projectId) throw new BadRequestException('Project details not found.');
    if (request.method !== 'GET') {
      request.body = { ...request.body, projectId };
    }
    request.query.projectId = projectId;
    return next.handle();
  }
}
