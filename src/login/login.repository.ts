import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/db/prisma.service';
import { CreateLoginInstanceDto } from './schema';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoginRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLoginInstance(data: CreateLoginInstanceDto) {
    const login = await this.prisma.login.create({ data });
    return login;
  }

  async getLoginInstance({ id }: { id: string }) {
    const login = await this.prisma.login.findUnique({
      where: { id },
    });
    return login;
  }

  async updateLoginInstance({
    id,
    data,
  }: {
    id: string;
    data: Prisma.LoginUpdateInput;
  }) {
    const login = await this.prisma.login.update({ where: { id }, data });
    return login;
  }

  async deleteLoginInstance({ id }: { id: string }) {
    const login = await this.prisma.login.delete({ where: { id } });
    return login;
  }

  async getLatestLoginInstanceForUser({ userId }: { userId: string }) {
    const login = await this.prisma.login.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return login;
  }
}
