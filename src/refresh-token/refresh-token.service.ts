import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { StoreRefreshTokenDto } from './schema';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  @OnEvent('refresh-token.created')
  @CatchEmitterErrors()
  async storeOrUpdateRefreshToken(data: StoreRefreshTokenDto) {
    const a = await this.refreshTokenRepository.storeRefreshToken(data);
  }
}
