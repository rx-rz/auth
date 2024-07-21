import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(data: Prisma.ProjectCreateInput) {
    const project = await this.prisma.project.create({
      data,
    });
    return project;
  }

  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    const updatedProject = await this.prisma.project.update({
      data,
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
      },
    });
    return updatedProject;
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
        roles: {
          select: {
            name: true,
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return project;
  }

  async getProjectUsers(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
        users: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            isVerified: true,
          },
        },
      },
    });
    return project;
  }

  async getProjectMagicLinks(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
        magicLinks: {
          select: {
            id: true,
            user: {
              select: { email: true },
            },
            createdAt: true,
          },
        },
      },
    });
    return project;
  }

  async getProjectRefreshTokens(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
        refreshTokens: {
          select: {
            token: true,
            expiresAt: true,
            createdAt: true,
            userId: true,
            state: true,
            authMethod: true,
          },
        },
      },
    });
    return project;
  }

  async getAllProjectsCreatedByAdmin(
    adminId: string,
    args?: Prisma.ProjectFindManyArgs,
  ) {
    const projects = await this.prisma.project.findMany({
      ...args,
      where: { adminId },
    });
    return projects;
  }

  async deleteProject(id: string) {
    const deletedProject = await this.prisma.project.delete({ where: { id } });
    return deletedProject;
  }

  async addUserToProject(userId: string, projectId: string) {
    const userAddedToProject = await this.prisma.userProject.create({
      data: { userId, projectId, roleId: 0 },
    });
    return userAddedToProject;
  }

  async removeUserFromProject(userId: string, projectId: string) {
    const userRemovedFromProject = await this.prisma.userProject.deleteMany({
      where: {
        userId,
        projectId,
      },
    });
    return userRemovedFromProject;
  }

  async assignUserProjectRole(
    userId: string,
    projectId: string,
    roleId: number,
  ) {
    const userAssignedARole = await this.prisma.userProject.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      update: {
        roleId,
      },
      create: {
        userId,
        projectId,
        roleId,
      },
    });
    return userAssignedARole;
  }
}
