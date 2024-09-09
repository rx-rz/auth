import { Injectable, NotFoundException } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import {
  GetRefreshTokenByTokenValueDto,
  StoreRefreshTokenDto,
  UpdateRefreshTokenStateDto,
} from './schema';
import { randomBytes } from 'crypto';


@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  @OnEvent('refresh-token.created')
  @CatchEmitterErrors()
  async storeRefreshToken(data: StoreRefreshTokenDto) {
    await this.refreshTokenRepository.storeRefreshToken(data);
  }

  generateRefreshToken(bytes = 32) {
    const buffer = randomBytes(bytes);
    const token = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return token;
  }

  async updateRefreshTokenState({ id, status }: UpdateRefreshTokenStateDto) {
    const refreshToken = await this.refreshTokenRepository.updateRefreshTokenStatus(id, status);
    return refreshToken;
  }

  async getRefreshTokenByTokenValue({ token }: GetRefreshTokenByTokenValueDto) {
    const refreshToken = await this.refreshTokenRepository.getRefreshTokenByTokenValue(token);
    return refreshToken;
  }
}
