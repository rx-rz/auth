import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { ProjectRepository } from 'src/project/project.repository';

@Module({
  controllers: [RoleController, PermissionController],
  providers: [RoleBasedAccessControlRepository, PermissionService, RoleService, ProjectRepository],
})
export class RoleBasedAccessControlModule {}
