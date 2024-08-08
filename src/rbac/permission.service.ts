import { Injectable, NotFoundException } from '@nestjs/common';
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

  async checkIfPermissionExists(permissionId: string) {
    const permission = await this.rbacRepository.getPermissionDetails(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission with provided details not found.');
    }
    return permission;
  }

  async createPermission({ name, description }: CreatePermissionDto) {
    const permission = await this.rbacRepository.createPermission({
      name,
      description,
    });
    return { success: true, permission };
  }

  async assignPermissionToRole({ permissionId, roleId }: AssignPermissionToRoleDto) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.assignPermissionToARole(permissionId, roleId);
    return { success: true, permission };
  }

  async getPermissionDetails({ permissionId }: PermissionIdDo) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.getPermissionDetails(permissionId);
    return { success: true, permission };
  }

  async updatePermission({ permissionId, ...data }: UpdatePermissionDto) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.updatePermission(permissionId, data);
    return { success: true, permission };
  }

  async deletePermission({ permissionId }: PermissionIdDo) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.deletePermission(permissionId);
    return { success: true, permission };
  }
}
