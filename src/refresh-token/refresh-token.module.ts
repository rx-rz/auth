import { Global, Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenRepository } from './refresh-token.repository';
import { LoginRepository } from 'src/login/login.repository';
import { LoginService } from 'src/login/login.service';
@Global()
@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, RefreshTokenRepository, LoginRepository, LoginService,],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
