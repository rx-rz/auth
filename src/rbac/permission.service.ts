import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import {
  AssignPermissionToRoleDto,
  CreatePermissionDto,
  PermissionIdDo,
  UpdatePermissionDto,
} from './schema';
import { IdDto as ProjectIdDto } from 'src/project/schema';
import { ProjectRepository } from 'src/project/project.repository';

@Injectable()
export class PermissionService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}
  private async checkIfProjectExists(projectId: string) {
    const existingProject = await this.projectRepository.getProject(projectId);
    if (!existingProject) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return existingProject;
  }

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

  async getProjectPermissions({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const permissions = await this.rbacRepository.getProjectPermissions(projectId);
    return { success: true, permissions };
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
