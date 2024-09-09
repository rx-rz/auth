import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';
import { AddUserToProjectDto } from './schema';

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

  async updateProjectSettings(projectId: string, data: Prisma.ProjectSettingsUpdateInput) {
    const projectSettings = await this.prisma.projectSettings.update({
      where: { projectId },
      data,
    });
    return projectSettings;
  }

  async createProjectSettings(projectId: string) {
    const projectSettings = await this.prisma.projectSettings.create({
      data: { projectId },
    });
    return projectSettings;
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

  async getProjectDetails(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        admin: true,
        oauthProviders: true,
        roles: true,
        permissions: true,
        projectSettings: true,
      },
    });
    return project;
  }

  async getProjectOAuthProviders(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        oauthProviders: true,
      },
    });
    return project?.oauthProviders ?? [];
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

  async getProjectRefreshTokens(id: string) {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { projectId: id },
      select: {
        authMethod: true,
        createdAt: true,
        id: true,
        state: true,
        token: true,
        userId: true,
      },
    });
    return refreshTokens;
  }

  async getAllProjectsCreatedByAdmin(adminId: string, args?: Prisma.ProjectFindManyArgs) {
    const projects = await this.prisma.project.findMany({
      ...args,
      where: { adminId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return projects;
  }

  async deleteProject(id: string) {
    const deletedProject = await this.prisma.project.delete({
      where: { id },
      select: { id: true, name: true },
    });
    return deletedProject;
  }

  async getUserFromProject(email: string, projectId: string) {
    const user = await this.prisma.userProject.findFirst({
      where: {
        user: { email },
        projectId,
      },
    });
    return user;
  }

  async addUserToProject(data: AddUserToProjectDto) {
    const user = await this.prisma.userProject.create({
      data,
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
    const roles = await this.prisma.role.findMany({
      where: { projectId },
      select: {
        name: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: {
          select: {
            permission: true,
          },
        },
      },
    });
    return roles;
  }

  async assignUserProjectRole(userId: string, projectId: string, roleId: string) {
    const userAssignedARole = await this.prisma.userProject.update({
      where: {
        userId_projectId: {
          userId: userId,
          projectId: projectId,
        },
      },
      data: {
        roleId,
      },
    });
    return userAssignedARole;
  }

  async removeUserProjectRole(userId: string, projectId: string, roleId: string) {
    const userRemovedFromRole = await this.prisma.userProject.update({
      where: { userId_projectId: { userId, projectId }, roleId },
      data: {
        roleId: null,
      },
      select: {
        projectId: true,
        user: { select: { email: true } },
      },
    });
    return userRemovedFromRole;
  }
}
