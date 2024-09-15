import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { OauthService } from './oauth.service';
import {
  AddOauthProviderToProjectDto,
  AddOauthProviderToProjectSchema,
  GetOAuthRegistrationLinkDto,
  GetTokensDto,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('add-provider-to-project')
  @UsePipes(new ZodPipe(AddOauthProviderToProjectSchema))
  async addOauthProviderToProject(@Body() body: AddOauthProviderToProjectDto) {
    return this.oauthService.addOauthProviderToProject(body);
  }

  @Post('get-authorization-url')
  async getAuthorizationUrl(@Body() body: GetOAuthRegistrationLinkDto) {
    return this.oauthService.getOAuthRegistrationLink(body);
  }

  @Get('callback')
  async oauthCallback(@Query() query: GetTokensDto) {
    console.log(query);
    return this.oauthService.getOauthCallback(query);
  }
}
