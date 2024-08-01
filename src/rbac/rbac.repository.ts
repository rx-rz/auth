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
        createdAt: true,
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

  async getRolePermissions(roleId: string) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      select: {
        role: {
          select: { name: true },
        },
        permission: {
          select: { description: true, name: true, id: true },
        },
      },
      where: { roleId },
    });
    return rolePermissions;
  }

  async getSpecificPermission(permissionId: string) {
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

  async updatePermission(
    permissionId: string,
    data: Prisma.PermissionUpdateInput,
  ) {
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

  async updateRoleName(roleId: string, newName: string) {
    const role = await this.prisma.role.update({
      where: { id: roleId },
      data: { name: newName },
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
        rolePermissions: true,
      },
    });
    return role;
  }

  async getRoleDetailsByNameAndProjectId(name: string, projectId: string) {
    const role = await this.prisma.role.findUnique({
      where: { name_projectId: { name, projectId } },
    });
    return role;
  }

  async deleteRole(roleId: string) {
    let role;
    const a = await this.prisma.$transaction(async (prisma) => {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });
      await this.prisma.permission.delete({
        where: { id: roleId },
      });
      role = await this.prisma.role.delete({
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
      await prisma.rolePermission.deleteMany({
        where: { permissionId },
      });
      permission = await prisma.permission.delete({
        where: { id: permissionId },
      });
    });
    return permission;
  }
}
