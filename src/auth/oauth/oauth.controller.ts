import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import {
  AddOauthProviderToProjectDto,
  AddOauthProviderToProjectSchema,
  GetOAuthRegistrationLinkDto,
  GetTokensDto,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { Response } from 'express';
import { OAUTH_ROUTES } from 'src/utils/constants/routes';

@Controller(OAUTH_ROUTES.BASE)
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post(OAUTH_ROUTES.ADD_PROVIDER_TO_PROJECT)
  @UsePipes(new ZodPipe(AddOauthProviderToProjectSchema))
  async addOauthProviderToProject(@Body() body: AddOauthProviderToProjectDto) {
    return this.oauthService.addOauthProviderToProject(body);
  }

  @Post(OAUTH_ROUTES.GET_AUTHORIZATION_URL)
  async getAuthorizationUrl(@Body() body: GetOAuthRegistrationLinkDto) {
    return this.oauthService.getOAuthRegistrationLink(body);
  }

  @Get('sign-in')
  async signIn(@Query() query: GetTokensDto, @Res() response: Response) {
    const { success, accessToken } =
      await this.oauthService.signIn(query);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, message: 'Authentication successful' };
  }
}
