import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({
      data,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        id: true,
      },
    });
    return user;
  }

  async updateUser(email: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({
      data,
      where: { email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        updatedAt: true,
        id: true,
      },
    });
    return user;
  }

  async deleteUser(email: string) {
    const user = await this.prisma.user.delete({
      where: { email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        id: true,
      },
    });
    return user;
  }

  async getUserDetails(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        updatedAt: true,
        id: true,
        authMethod: true,
      },
    });
    return user;
  }

  async getUserPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user?.password || '';
  }

  async updateUserPassword(email: string, newPassword: string) {
    const user = await this.prisma.user.update({
      where: { email },
      data: { password: newPassword },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        updatedAt: true,
        id: true,
      },
    });
    return user;
  }

  async updateUserEmail(email: string, newEmail: string) {
    const user = await this.prisma.user.update({
      where: { email },
      data: { email: newEmail },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        updatedAt: true,
        id: true,
      },
    });
    return user;
  }
}
