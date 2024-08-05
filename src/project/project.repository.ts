import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(data: Prisma.ProjectCreateInput) {
    const project = await this.prisma.project.create({
      data,
      select: {
        adminId: true,
        name: true,
        id: true,
        createdAt: true,
      },
    });
    return project;
  }

  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    const updatedProject = await this.prisma.project.update({
      data,
      where: { id },
      select: {
        adminId: true,
        name: true,
        id: true,
        createdAt: true,
      },
    });
    return updatedProject;
  }

  async getProjectApiKeys(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        apiKey: true,
        clientKey: true,
      },
    });
    return {
      apiKey: project?.apiKey || '',
      clientKey: project?.clientKey || '',
    };
  }

  async getProjectIDByClientKey(clientKey: string) {
    const project = await this.prisma.project.findUnique({
      where: { clientKey },
      select: {
        id: true,
      },
    });
    return project?.id || null;
  }

  async getProjectApiKeyByClientKey(clientKey: string) {
    const project = await this.prisma.project.findUnique({
      where: { clientKey },
      select: {
        apiKey: true,
        id: true,
      },
    });
    return { apiKey: project?.apiKey, projectId: project?.id };
  }

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        adminId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return project;
  }

  async getProjectUsers(id: string) {
    const projectUsers = await this.prisma.userProject.findMany({
      where: { projectId: id },
      select: {
        firstName: true,
        lastName: true,
        isVerified: true,
        createdAt: true,
        role: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return projectUsers;
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

  async getAllProjectsCreatedByAdmin(adminId: string, args?: Prisma.ProjectFindManyArgs) {
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

  async addUserToProject(
    firstName: string,
    lastName: string,
    userId: string,
    projectId: string,
    password?: string,
  ) {
    const user = await this.prisma.userProject.create({
      data: {
        firstName,
        lastName,
        userId,
        projectId,
        password,
      },
      select: {
        firstName: true,
        lastName: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return user;
  }

  async deleteUserFromProject(userId: string, projectId: string) {
    const user = await this.prisma.userProject.delete({
      where: {
        userId_projectId: {
          projectId,
          userId,
        },
      },
      select: {
        firstName: true,
        lastName: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return user;
  }

  async getProjectRoles(projectId: string) {
    const projectRoles = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        id: true,
        createdAt: true,
        roles: {
          select: {
            name: true,
            id: true,
            createdAt: true,
          },
        },
      },
    });
    return projectRoles;
  }

  async assignUserProjectRole(userId: string, projectId: string, roleId: string) {
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
        firstName: '',
        lastName: '',
      },
    });
    return userAssignedARole;
  }
}
