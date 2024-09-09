import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import { CreateRoleDto, RoleIdDto, UpdateRoleNameDto } from './schema';
import { IdSchema as ProjectIdSchema, IdDto as ProjectIdDto } from 'src/project/schema';

@Injectable()
export class RoleService {
  constructor(private readonly rbacRepository: RoleBasedAccessControlRepository) {}

  async checkIfRoleExists(roleId: string) {
    const role = await this.rbacRepository.getRoleDetails(roleId);
    if (!role) {
      throw new NotFoundException('Role with provided details not found.');
    }
    return role;
  }

  async createRole({ name, projectId }: CreateRoleDto) {
    const existingRole = await this.rbacRepository.getRoleDetailsByNameAndProjectId(
      name,
      projectId,
    );
    if (name === 'rollo-admin')
      throw new ConflictException('Cannot create a role with this name as it is already in use.');
    if (existingRole)
      throw new ConflictException('Role with same name is already attached to this project.');
    const role = await this.rbacRepository.createRole({
      name,
      project: {
        connect: { id: projectId },
      },
    });
    return { success: true, role };
  }

  async getProjectRoles({ projectId }: ProjectIdDto) {
    await this.checkIfRoleExists(projectId);
    const roles = await this.rbacRepository.getProjectRoles(projectId);
    return { success: true, roles };
  }

  async updateRoleName({ name, roleId }: UpdateRoleNameDto) {
    await this.checkIfRoleExists(roleId);
    const role = await this.rbacRepository.updateRoleName(roleId, name);
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
