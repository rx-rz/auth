import { Injectable } from '@nestjs/common';
import { RoleBasedAccessControlRepository } from './rbac.repository';

@Injectable()
export class PermissionService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
  ) {}

  async createPermission(name: string, description: string) {
    const permission = await this.rbacRepository.createPermission({
      name,
      description,
    });
    return { success: true, permission };
  }

  async assignPermissionToRole(permissionId: string, roleId: string) {
    const permission = await this.rbacRepository.assignPermissionToARole(permissionId, roleId)
    return {success: true, permission}
  }

  async getPermission(permissionId: string) {
    const permission = await this.rbacRepository.getSpecificPermission(permissionId)
  return permission
  }

  async updatePermission() {
    
  }

  async deletePermission() {}
}
