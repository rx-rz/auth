import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController, PermissionController],
  providers: [RoleBasedAccessControlRepository, PermissionService, RoleService],
})
export class RoleBasedAccessControlModule {}
