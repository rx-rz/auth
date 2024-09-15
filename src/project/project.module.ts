import { Global, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { AdminRepository } from 'src/admin/admin.repository';

@Global()
@Module({
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, AdminRepository],
  exports: [ProjectService],
})
export class ProjectModule {}
