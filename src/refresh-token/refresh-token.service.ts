import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { StoreRefreshTokenDto } from './dtos/store-refresh-token.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @OnEvent('refresh-token.created')
  async storeRefreshToken(storeRefreshTokenDto: StoreRefreshTokenDto) {
    await this.refreshTokenRepository.storeRefreshToken(storeRefreshTokenDto);
  }
}
