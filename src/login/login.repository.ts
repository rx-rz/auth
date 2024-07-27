import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';
import { CreateLoginInstanceDto } from './dtos/create-login-instance-dto';

@Injectable()
export class LoginRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLoginInstance(data: CreateLoginInstanceDto) {
    const login = await this.prisma.login.create({ data });
    return login;
  }

  async deleteLoginInstance(id: string) {
    const login = await this.prisma.login.delete({ where: { id } });
    return login;
  }
}
