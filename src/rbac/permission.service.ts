import { Injectable } from '@nestjs/common';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import {
  AssignPermissionToRoleDto,
  CreatePermissionDto,
  PermissionIdDo,
  UpdatePermissionDto,
} from './schema';

@Injectable()
export class PermissionService {
  constructor(private readonly rbacRepository: RoleBasedAccessControlRepository) {}

  async createPermission({ name, description }: CreatePermissionDto) {
    const permission = await this.rbacRepository.createPermission({
      name,
      description,
    });
    return { success: true, permission };
  }

  async assignPermissionToRole({ permissionId, roleId }: AssignPermissionToRoleDto) {
    const permission = await this.rbacRepository.assignPermissionToARole(permissionId, roleId);
    return { success: true, permission };
  }

  async getPermission({ permissionId }: PermissionIdDo) {
    const permission = await this.rbacRepository.getSpecificPermission(permissionId);
    return permission;
  }

  async updatePermission({ permissionId, ...data }: UpdatePermissionDto) {
    const permission = await this.rbacRepository.updatePermission(permissionId, data);
    return permission;
  }

  async deletePermission({ permissionId }: PermissionIdDo) {
    const permission = await this.rbacRepository.deletePermission(permissionId);
    return permission;
  }
}
