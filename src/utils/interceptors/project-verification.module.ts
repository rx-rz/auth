import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProjectService } from 'src/project/project.service';
import { ProjectVerificationInterceptor } from './project-verification.interceptor';
import { ProjectRepository } from 'src/project/project.repository';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';

@Module({
  providers: [
    ProjectService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ProjectVerificationInterceptor,
    },
    ProjectRepository,
    UserRepository,
    AdminRepository,
  ],
})
export class ProjectVerificationInterceptorModule {}