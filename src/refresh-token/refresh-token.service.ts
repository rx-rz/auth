import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { StoreRefreshTokenDto } from './schema';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @CatchEmitterErrors()
  @OnEvent('refresh-token.created')
  async storeOrUpdateRefreshToken(data: StoreRefreshTokenDto) {
    await this.refreshTokenRepository.storeRefreshToken(data);
  }
}
