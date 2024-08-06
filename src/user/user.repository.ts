import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    console.log(data);
    const user = await this.prisma.user.create({
      data: { email: data.email },
      select: {
        email: true,
        createdAt: true,
        id: true,
      },
    });
    return user;
  }

  async updateUserDetails(userId: string, projectId: string, data: Prisma.UserProjectUpdateInput) {
    const user = await this.prisma.userProject.update({
      data,
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      select: {
        firstName: true,
        lastName: true,
        isVerified: true,
      },
    });
    return user;
  }

  async deleteUser(email: string) {
    let user;
    await this.prisma.$transaction(async (prisma) => {
      await this.prisma.userProject.deleteMany({
        where: {
          user: {
            email,
          },
        },
      });
      user = await this.prisma.user.delete({
        where: { email },
        select: {
          email: true,
          id: true,
        },
      });
    });
    return user;
  }

  async getUserProjectDetails(userId: string, projectId: string) {
    const user = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      select: {
        firstName: true,
        lastName: true,
        createdAt: true,
        isVerified: true,
        user: {
          select: {
            email: true,
          },
        },
        role: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return user;
  }

  async getUserProjectDetailsByEmail(email: string, projectId: string) {
    const user = await this.prisma.userProject.findFirst({
      where: {
        user: {
          email,
        },
        projectId,
      },
      select: {
        firstName: true,
        lastName: true,
        createdAt: true,
        isVerified: true,
        user: {
          select: {
            email: true,
          },
        },
        role: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        id: true,
        userProjects: {
          select: {
            projectId: true,
            isVerified: true,
          },
        },
      },
    });
    return user;
  }
  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        id: true,
        userProjects: {
          select: {
            projectId: true,
            isVerified: true,
          },
        },
      },
    });
    return user;
  }

  async getUserPassword(email: string, projectId: string) {
    await this.prisma.userProject.findMany({ where: { user: { email } } });
    const user = await this.prisma.userProject.findFirst({
      where: {
        user: {
          email,
        },
        projectId,
      },
    });
    return user?.password || '';
  }

  async updateUserPassword(userId: string, projectId: string, newPassword: string) {
    const user = await this.prisma.userProject.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: { password: newPassword },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return user;
  }

  async updateUserEmail(email: string, newEmail: string) {
    const user = await this.prisma.user.update({
      where: { email },
      data: { email: newEmail },
      select: {
        email: true,
        updatedAt: true,
        id: true,
      },
    });
    return user;
  }

  async getUserProjects(email: string) {
    const userProjects = await this.prisma.userProject.findMany({
      where: {
        user: {
          email,
        },
      },
    });
    return userProjects;
  }
}
