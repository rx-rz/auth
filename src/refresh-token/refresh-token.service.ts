import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { StoreRefreshTokenDto, UpdateRefreshTokenStateDto } from './schema';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  @OnEvent('refresh-token.created')
  @CatchEmitterErrors()
  async storeRefreshToken(data: StoreRefreshTokenDto) {
    await this.refreshTokenRepository.storeRefreshToken(data);
  }

  async updateRefreshTokenState({ id, status }: UpdateRefreshTokenStateDto) {
    const refreshToken = await this.refreshTokenRepository.updateRefreshTokenStatus(id, status);
    return refreshToken;
  }
}
