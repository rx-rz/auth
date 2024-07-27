import { RoleBasedAccessControlRepository } from './rbac.repository';

export class RoleService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
  ) {}

  async createRole(name: string, projectId: string) {
    await this.rbacRepository.createRole({
      name,
        project: {
        connect: { id: projectId },
      },
    });
  }

  async getRolePermissions(roleId: number) {
    const rolePermissions =
      await this.rbacRepository.getRolePermissions(roleId);
    return { success: true, rolePermissions };
  }

  async updateRoleName(roleId: number, newName: string) {
    const role = await this.rbacRepository.updateRoleName(roleId, newName);
    return { success: true, role };
  }

  async getRoleDetails(roleId: number) {
    const role = await this.rbacRepository.getRoleDetails(roleId);
    return { success: true, role };
  }

  async deleteRole(roleId: number) {
    const role = await this.rbacRepository.deleteRole(roleId);
    return { success: true, role };
  }
}
