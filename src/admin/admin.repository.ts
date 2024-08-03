import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  adminReturnObject = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    isVerified: true,
    mfaEnabled: true,
  };

  async createAdmin(data: Prisma.AdminCreateInput) {
    const admin = await this.prisma.admin.create({
      data,
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminByID(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    return admin?.password || '';
  }

  async updateAdmin(email: string, data: Prisma.AdminUpdateInput) {
    const admin = await this.prisma.admin.update({
      where: { email },
      data,
      select: this.adminReturnObject,
    });
    return admin;
  }

  async updateAdminEmail(currentEmail: string, newEmail: string) {
    const admin = await this.prisma.admin.update({
      where: { email: currentEmail },
      data: { email: newEmail },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async updateAdminPassword(email: string, newPassword: string) {
    const admin = await this.prisma.admin.update({
      where: { email },
      data: { password: newPassword },
      select: this.adminReturnObject,
    });
    return admin;
  }

  async getAdminProjects(adminId: string) {
    const adminProjects = await this.prisma.project.findMany({
      where: {
        adminId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
    return adminProjects;
  }

  async getAdminProjectByName(adminId: string, name: string) {
    const adminProject = await this.prisma.project.findUnique({
      where: {
        project_name_admin_id_unique: {
          name,
          adminId,
        },
      },
    });
    return adminProject;
  }

  async deleteAdmin(adminId: string) {
    const admin = await this.prisma.admin.delete({
      where: { id: adminId },
      select: this.adminReturnObject,
    });
    return admin;
  }
}
