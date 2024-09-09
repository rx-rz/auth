import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/db/prisma.service';

@Injectable()
export class MagicLinkAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMagicLink(data: Prisma.MagicLinkCreateInput) {
    const magicLink = await this.prisma.magicLink.create({ data });
    return magicLink;
  }

  async getMagicLink(){
    
  }

  async deleteMagicLink(id: string) {
    const magicLink = await this.prisma.magicLink.delete({ where: { id } });
    return magicLink;
  }
}
