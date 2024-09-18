import { Body, Controller, Get, Query } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { UpdateRefreshTokenStateDto } from './schema';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async updateRefreshTokenStatus(@Body() body: UpdateRefreshTokenStateDto) {
    return this.refreshTokenService.updateRefreshTokenState(body);
  }

  async deleteRefreshTokensCron(@Query() query: { projectId: string }) {
    
  }

}
