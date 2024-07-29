import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role-dto';
import { RoleIdDto } from './dtos/role-id-dto';
import { UpdateRoleNameDto } from './dtos/update-role-name-dto';
import { RoleBasedAccessControlRepository } from './rbac.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
  ) {}

  async createRole({ name, projectId }: CreateRoleDto) {
    await this.rbacRepository.createRole({
      name,
      project: {
        connect: { id: projectId },
      },
    });
  }

  async getRolePermissions({ roleId }: RoleIdDto) {
    const rolePermissions =
      await this.rbacRepository.getRolePermissions(roleId);
    return { success: true, rolePermissions };
  }

  async updateRoleName({newName, roleId}: UpdateRoleNameDto) {
    const role = await this.rbacRepository.updateRoleName(roleId, newName);
    return { success: true, role };
  }

  async getRoleDetails({ roleId }: RoleIdDto) {
    const role = await this.rbacRepository.getRoleDetails(roleId);
    return { success: true, role };
  }

  async deleteRole({ roleId }: RoleIdDto) {
    const role = await this.rbacRepository.deleteRole(roleId);
    return { success: true, role };
  }
}
