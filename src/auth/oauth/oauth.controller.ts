import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { AddOauthProviderToProjectDto, GetOAuthRegistrationLinkDto, GetTokensDto } from './schema';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('add-provider-to-project')
  async addOauthProviderToProject(@Body() body: AddOauthProviderToProjectDto) {
    return this.oauthService.addOauthProviderToProject(body);
  }

  @Post('get-authorization-url')
  async getAuthorizationUrl(@Body() body: GetOAuthRegistrationLinkDto) {
    return this.oauthService.getOAuthRegistrationLink(body);
  }

  @Get('callback')
  async oauthCallback(@Query() query: GetTokensDto) {
    return this.oauthService.getOauthCallback(query);
  }
}
