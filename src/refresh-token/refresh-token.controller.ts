import { Controller, Get, Query } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { GetRefreshTokenByTokenValueDto } from './schema';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  // @Get('/token')
  // async getRefreshToken(@Query() query: GetRefreshTokenByTokenValueDto) {
  //   return this.refreshTokenService.getRefreshToken(query);
  // }
}
