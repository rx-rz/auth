import { Injectable } from '@nestjs/common';
import { AuthMethod, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';
import { AddUserToBlocklistDto } from './schema';

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

  async updateProjectSettings({
    projectId,
    data,
  }: {
    projectId: string;
    data: Prisma.ProjectSettingsUpdateInput;
  }) {
    const projectSettings = await this.prisma.projectSettings.update({
      where: { projectId },
      data,
    });
    return projectSettings;
  }

  async createProjectSettings({ projectId }: { projectId: string }) {
    const projectSettings = await this.prisma.projectSettings.create({
      data: { projectId },
    });
    return projectSettings;
  }

  async getProjectSettings({ projectId }: { projectId: string }) {
    const projectSettings = await this.prisma.projectSettings.findUnique({
      where: { projectId },
    });
    return projectSettings;
  }

  async updateProject({
    projectId,
    data,
  }: {
    projectId: string;
    data: Prisma.ProjectUpdateInput;
  }) {
    const updatedProject = await this.prisma.project.update({
      data,
      where: { id: projectId },
      select: {
        adminId: true,
        name: true,
        id: true,
        createdAt: true,
      },
    });
    return updatedProject;
  }

  async getProjectApiKeys({ projectId }: { projectId: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
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

  async getProjectIDByClientKey({ clientKey }: { clientKey: string }) {
    const project = await this.prisma.project.findUnique({
      where: { clientKey },
      select: {
        id: true,
      },
    });
    return project?.id || null;
  }

  async getProjectApiKeyByClientKey({ clientKey }: { clientKey: string }) {
    const project = await this.prisma.project.findUnique({
      where: { clientKey },
      select: {
        apiKey: true,
        id: true,
      },
    });
    return { apiKey: project?.apiKey, projectId: project?.id };
  }

  async getProject({ projectId }: { projectId: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
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

  async addUserToProjectBlocklist({
    userId,
    projectId,
  }: {
    userId: string;
    projectId: string;
  }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.userProject.update({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
        data: {
          userStatus: 'BLOCKED',
        },
      });
      await tx.blockList.create({
        data: {
          userId,
          projectId,
        },
      });
    });
  }

  async removeUserFromBlocklist({
    userId,
    projectId,
  }: {
    userId: string;
    projectId: string;
  }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.userProject.update({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
        data: {
          userStatus: 'ACTIVE',
        },
      });
      await tx.blockList.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    });
  }

  async getUserFromProjectBlocklist({
    userId,
    projectId,
  }: {
    userId: string;
    projectId: string;
  }) {
    const user = await this.prisma.blockList.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      select: {
        userId: true,
        createdAt: true,
      },
    });
    return user;
  }

  async getProjectBlocklist({ projectId }: { projectId: string }) {
    const blocklist = await this.prisma.blockList.findMany({
      where: {
        projectId,
      },
    });
    return blocklist;
  }

  async getProjectDetails({ projectId }: { projectId: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        admin: {
          select: {
            email: true,
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        oauthProviders: true,
        roles: true,
        permissions: true,
        projectSettings: true,
      },
    });
    return project;
  }

  async getProjectOAuthProviders({ projectId }: { projectId: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        oauthProviders: true,
      },
    });
    return project?.oauthProviders ?? [];
  }

  async getProjectUsers({ projectId }: { projectId: string }) {
    const projectUsers = await this.prisma.userProject.findMany({
      where: { projectId },
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

  async getProjectRefreshTokens({ projectId }: { projectId: string }) {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { projectId },
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

  async getAllProjectsCreatedByAdmin({
    adminId,
    args,
  }: {
    adminId: string;
    args?: Prisma.ProjectFindManyArgs;
  }) {
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

  async deleteProject({ projectId }: { projectId: string }) {
    const deletedProject = await this.prisma.project.delete({
      where: { id: projectId },
      select: { id: true, name: true },
    });
    return deletedProject;
  }

  async getUserFromProject({
    userId,
    projectId,
  }: {
    userId: string;
    projectId: string;
  }) {
    const user = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });
    return user;
  }

  async addUserToProject(data: Prisma.UserProjectCreateInput) {
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

  async deleteUserFromProject({
    userId,
    projectId,
  }: {
    userId: string;
    projectId: string;
  }) {
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

  async getProjectRoles({ projectId }: { projectId: string }) {
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

  async assignUserProjectRole({
    userId,
    projectId,
    roleId,
  }: {
    userId: string;
    projectId: string;
    roleId: string;
  }) {
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

  async removeUserProjectRole({
    userId,
    roleId,
    projectId,
  }: {
    userId: string;
    projectId: string;
    roleId: string;
  }) {
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
