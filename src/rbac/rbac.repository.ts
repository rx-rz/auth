import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

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
    await this.prisma.permission.create({ data });
  }

  async assignPermissionToARole(permissionId: number, roleId: number) {
    await this.prisma.rolePermission.create({
      data: {
        permissionId,
        roleId,
      },
    });
  }

  async getRolePermissions(roleId: number) {
    await this.prisma.rolePermission.findMany({
      select: {
        permission: {
          select: { description: true, name: true, id: true },
        },
      },
      where: { roleId },
    });
  }

  async getSpecificPermission(permissionId: number) {
    await this.prisma.permission.findUnique({
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
  }

  async updatePermission(
    permissionId: number,
    data: Prisma.PermissionUpdateInput,
  ) {
    await this.prisma.permission.update({
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
  }

  async updateRoleName(roleId: number, newName: string) {
    await this.prisma.role.update({
      where: { id: roleId },
      data: { name: newName },
    });
  }

  async getRoleDetails(roleId: number) {
    await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        projectId: true,
        rolePermissions: true,
      },
    });
  }

  async deleteRole(roleId: number) {
    await this.prisma.$transaction(async (prisma) => {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });
      await this.prisma.permission.delete({
        where: { id: roleId },
      });
    });
    await this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async deletePermission(permissionId: number) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.rolePermission.deleteMany({
        where: { permissionId },
      });
      await prisma.permission.delete({
        where: { id: permissionId },
      });
    });
  }
}
