import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProjectService } from 'src/project/project.service';
import { ProjectVerificationInterceptor } from './project-verification.interceptor';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { ProjectRepository } from 'src/project/project.repository';

@Module({
  providers: [
    ProjectService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ProjectVerificationInterceptor,
    },
    UserRepository,
    ProjectRepository,
    AdminRepository,
  ],
})
export class ProjectVerificationInterceptorModule {}
