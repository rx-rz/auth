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

  async getRolePermissions() {}

  async updateRoleName() {}

  async getRoleDetails() {}

  async deleteRole() {}
}
