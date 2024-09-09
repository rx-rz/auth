import { Global, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';

@Global()
@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, UserRepository, AdminRepository],
  exports: [ProjectRepository, ProjectService],
})
export class ProjectModule {}
