import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role-dto';
import { RoleIdDto } from './dtos/role-id-dto';
import { UpdateRoleNameDto } from './dtos/update-role-name-dto';
import { RoleBasedAccessControlRepository } from './rbac.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
  ) {}
  async checkIfRoleExists(roleId: number) {
    const role = await this.rbacRepository.getRoleDetails(roleId);
    if (!role) {
      throw new NotFoundException('Role with provided details not found.');
    }
    return role;
  }
  async createRole({ name, projectId }: CreateRoleDto) {
    const existingRole =
      await this.rbacRepository.getRoleDetailsByNameAndProjectId(
        name,
        projectId,
      );
    if (existingRole)
      throw new ConflictException(
        'Role with same name is already attached to this project.',
      );
    const role = await this.rbacRepository.createRole({
      name,
      project: {
        connect: { id: projectId },
      },
    });
    return { success: true, role };
  }

  async getRolePermissions({ roleId }: RoleIdDto) {
    await this.checkIfRoleExists(roleId);
    const rolePermissions =
      await this.rbacRepository.getRolePermissions(roleId);
    return { success: true, rolePermissions };
  }

  async updateRoleName({ newName, roleId }: UpdateRoleNameDto) {
    await this.checkIfRoleExists(roleId);
    const role = await this.rbacRepository.updateRoleName(roleId, newName);
    return { success: true, role };
  }

  async getRoleDetails({ roleId }: RoleIdDto) {
    await this.checkIfRoleExists(roleId);
    const role = await this.rbacRepository.getRoleDetails(roleId);
    return { success: true, role };
  }

  async deleteRole({ roleId }: RoleIdDto) {
        await this.checkIfRoleExists(roleId);
    const role = await this.rbacRepository.deleteRole(roleId);
    return { success: true, role };
  }
}
