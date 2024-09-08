import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class RoleBasedAccessControlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(data: Prisma.RoleCreateInput) {
    const role = await this.prisma.role.create({
      data,
      select: {
        id: true,
        name: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return role;
  }

  async createPermission(data: Prisma.PermissionCreateInput) {
    const permission = await this.prisma.permission.create({ data });
    return permission;
  }

  async assignPermissionToARole(permissionId: string, roleId: string) {
    const assignedPermission = await this.prisma.rolePermission.create({
      data: {
        permissionId,
        roleId,
      },
      select: {
        permission: {
          select: { name: true, id: true },
        },
        role: {
          select: { name: true, id: true },
        },
      },
    });
    return assignedPermission;
  }

  async removePermissionFromRole(permissionId: string, roleId: string) {
    const removedPermission = await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    return removedPermission;
  }

  async getPermissionDetails(permissionId: string) {
    const permission = await this.prisma.permission.findUnique({
      select: {
        id: true,
        description: true,
        name: true,
        rolePermissions: {
          select: { roleId: true },
        },
      },
      where: { id: permissionId },
    });
    return permission;
  }

  async updatePermission(permissionId: string, data: Prisma.PermissionUpdateInput) {
    const permission = await this.prisma.permission.update({
      select: {
        id: true,
        description: true,
        name: true,
        rolePermissions: {
          select: { roleId: true },
        },
      },
      where: { id: permissionId },
      data,
    });
    return permission;
  }

  async updateRoleName(roleId: string, name: string) {
    const role = await this.prisma.role.update({
      where: { id: roleId },
      data: { name },
      select: {
        id: true,
        name: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return role;
  }

  async getRoleDetails(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: true,
      },
    });
    return role;
  }

  async getRoleDetailsByNameAndProjectId(name: string, projectId: string) {
    const role = await this.prisma.role.findUnique({
      where: { name_projectId: { name, projectId } },
      select: {
        id: true,
        name: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return role;
  }

  async getProjectPermissions(projectId: string) {
    const permissions = await this.prisma.rolePermission.findMany({
      where: { role: { projectId } },
      select: {
        permission: true,
      },
    });
    return permissions;
  }

  async deleteRole(roleId: string) {
    let role;
    await this.prisma.$transaction(async (prisma) => {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
      });
      if (rolePermissions && rolePermissions.length > 0) {
        await prisma.rolePermission.deleteMany({
          where: { roleId },
        });
        await prisma.permission.delete({
          where: { id: roleId },
        });
      }
      role = await prisma.role.delete({
        where: { id: roleId },
        select: {
          id: true,
          name: true,
        },
      });
    });
    return role;
  }

  async deletePermission(permissionId: string) {
    let permission;
    await this.prisma.$transaction(async (prisma) => {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { permissionId },
      });
      if (rolePermissions && rolePermissions.length > 0) {
        await prisma.rolePermission.deleteMany({
          where: { permissionId },
        });
      }
      permission = await prisma.permission.delete({
        where: { id: permissionId },
      });
    });
    return permission;
  }
}
