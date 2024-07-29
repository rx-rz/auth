import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { StoreRefreshTokenDto } from './dtos/store-refresh-token.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @CatchEmitterErrors()
  @OnEvent('refresh-token.created')
  async storeOrUpdateRefreshToken(storeRefreshTokenDto: StoreRefreshTokenDto) {
    console.log("here!")
    await this.refreshTokenRepository.storeRefreshToken(storeRefreshTokenDto);
  }
}
