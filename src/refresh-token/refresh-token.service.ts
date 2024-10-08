import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import {
  GetRefreshTokenByTokenValueDto,
  StoreAdminRefreshTokenDto,
  StoreRefreshTokenDto,
  UpdateRefreshTokenStateDto,
} from './schema';
import { randomBytes } from 'crypto';
import { ProjectService } from 'src/project/project.service';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,

  ) {}

  generateRefreshToken(bytes = 32) {
    const buffer = randomBytes(bytes);
    const token = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return token;
  }

  async storeRefreshToken(data: StoreRefreshTokenDto) {
    await this.refreshTokenRepository.storeRefreshToken(data);
  }

  async storeAdminRefreshToken(data: StoreAdminRefreshTokenDto) {
    const { adminId, ...body } = data;
    await this.refreshTokenRepository.storeAdminRefreshToken({
      admin: { connect: { id: adminId } },
      ...body,
    });
  }

  async updateRefreshTokenState({ id, status }: UpdateRefreshTokenStateDto) {
    const refreshToken =
      await this.refreshTokenRepository.updateRefreshTokenStatus(id, status);
    return refreshToken;
  }

  async getRefreshTokenByTokenValue({ token }: GetRefreshTokenByTokenValueDto) {
    const refreshToken =
      await this.refreshTokenRepository.getRefreshTokenByTokenValue(token);
    return refreshToken;
  }
}
