import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/db/prisma.service';
import { CreateLoginInstanceDto } from './schema';
@Injectable()
export class LoginRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLoginInstance(data: CreateLoginInstanceDto) {
    const login = await this.prisma.login.create({ data });
    return login;
  }

  async getLoginInstance(id: string) {
    const login = await this.prisma.login.findUnique({
      where: { id },
      select: { id: true },
    });
    return login;
  }

  async deleteLoginInstance(id: string) {
    const login = await this.prisma.login.delete({ where: { id } });
    return login;
  }
}
