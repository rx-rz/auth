import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleBasedAccessControlRepository } from './rbac.repository';
import {
  AssignPermissionToRoleDto,
  CreatePermissionDto,
  PermissionIdDto,
  RemovePermissionFromRoleDto,
  UpdatePermissionDto,
} from './schema';
import { ProjectService } from 'src/project/project.service';
import { ProjectIdDto } from 'src/project/schema';

@Injectable()
export class PermissionService {
  constructor(
    private readonly rbacRepository: RoleBasedAccessControlRepository,
    private readonly projectService: ProjectService,
  ) {}

  async checkIfPermissionExists(permissionId: string) {
    const permission =
      await this.rbacRepository.getPermissionDetails(permissionId);
    if (!permission) {
      throw new NotFoundException(
        'Permission with provided details not found.',
      );
    }
    return permission;
  }

  async checkIfRoleExists(roleId: string) {
    const role = await this.rbacRepository.getRoleDetails(roleId);
    if (!role) {
      throw new NotFoundException('Role with provided details not found.');
    }
    return role;
  }

  async createPermission({
    name,
    description,
    projectId,
  }: CreatePermissionDto) {
    const permission = await this.rbacRepository.createPermission({
      name,
      description,
      project: {
        connect: {
          id: projectId,
        },
      },
    });
    return { success: true, permission };
  }

  async assignPermissionToRole({
    permissionId,
    roleId,
  }: AssignPermissionToRoleDto) {
    await this.checkIfPermissionExists(permissionId);
    await this.checkIfRoleExists(roleId);
    const permission = await this.rbacRepository.assignPermissionToARole(
      permissionId,
      roleId,
    );
    return { success: true, permission };
  }

  async removePermissionFromRole({
    permissionId,
    roleId,
  }: RemovePermissionFromRoleDto) {
    await this.checkIfPermissionExists(permissionId);
    await this.checkIfRoleExists(roleId);
    const permission = await this.rbacRepository.removePermissionFromRole(
      permissionId,
      roleId,
    );
    return { success: true, permission };
  }

  async getPermissionDetails({ permissionId }: PermissionIdDto) {
    await this.checkIfPermissionExists(permissionId);
    const permission =
      await this.rbacRepository.getPermissionDetails(permissionId);
    return { success: true, permission };
  }

  async getProjectPermissions({ projectId }: ProjectIdDto) {
    await this.projectService.checkIfProjectExists(projectId);
    const permissions =
      await this.rbacRepository.getProjectPermissions(projectId);
    return { success: true, permissions };
  }

  async updatePermission({ permissionId, ...data }: UpdatePermissionDto) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.updatePermission(
      permissionId,
      data,
    );
    return { success: true, permission };
  }

  async deletePermission({ permissionId }: PermissionIdDto) {
    await this.checkIfPermissionExists(permissionId);
    const permission = await this.rbacRepository.deletePermission(permissionId);
    return { success: true, permission };
  }
}
