import { Global, Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenRepository } from './refresh-token.repository';

@Global()
@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
