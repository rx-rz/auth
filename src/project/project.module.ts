import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';

@Module({
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ProjectRepository,
    UserRepository,
    AdminRepository,
  ],
})
export class ProjectModule {}
