import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ROUTES } from 'src/utils/constants/routes';
import { AdminGuard } from 'src/guard/admin.guard';
import * as SchemaDtos from './schema';
import { Response } from 'express';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import {
  openApiDeleteAdminOpts,
  openApiGetAdminProjectByNameOpts,
  openApiGetAdminProjectsOpts,
  openApiLoginAdminOpts,
  openApiRegisterAdminOpts,
  openApiUpdateAdminEmailOpts,
  openApiUpdateAdminOpts,
  openApiUpdateAdminPasswordOpts,
} from './open-api';
import { OpenApiEndpoint } from 'src/utils/decorators/openapi-endpoint.decorator';
import * as ResponseTypes from './response-types';

@ApiTags('admin')
@Controller(ADMIN_ROUTES.BASE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @OpenApiEndpoint({
    responses: [
      openApiRegisterAdminOpts.successResponse,
      openApiRegisterAdminOpts.conflictResponse,
    ],
    options: openApiDeleteAdminOpts.options,
  })
  @UsePipes(new ZodPipe(SchemaDtos.RegisterAdminSchema))
  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(
    @Body() body: SchemaDtos.RegisterAdminDto,
  ): Promise<ResponseTypes.RegisterAdminResponse> {
    return this.adminService.registerAdmin(body);
  }

  @OpenApiEndpoint({
    options: openApiLoginAdminOpts.options,
    responses: [
      openApiLoginAdminOpts.successResponse,
      openApiLoginAdminOpts.unauthorizedResponse,
      openApiLoginAdminOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(SchemaDtos.LoginAdminSchema))
  @Post(ADMIN_ROUTES.LOGIN)
  async loginAdmin(
    @Body() body: SchemaDtos.LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTypes.LoginAdminResponse> {
    const { accessToken, refreshToken, success } =
      await this.adminService.loginAdmin(body);
    this.setCookies(response, accessToken, refreshToken);
    return { success, message: 'Login successful', accessToken };
  }

  @Get(ADMIN_ROUTES.LOGOUT)
  async logoutAdmin(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTypes.LogoutAdminResponse> {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return { success: true, message: 'Admin logged out successfully' };
  }

  @OpenApiEndpoint({
    options: openApiUpdateAdminOpts.options,
    responses: [
      openApiUpdateAdminOpts.successResponse,
      openApiUpdateAdminOpts.badRequestResponse,
      openApiUpdateAdminOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(SchemaDtos.UpdateAdminSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_DETAILS)
  @UseGuards(AdminGuard)
  async updateAdmin(
    @Body() body: SchemaDtos.UpdateAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTypes.UpdateAdminResponse> {
    const { accessToken, success, message } =
      await this.adminService.updateAdmin(body);
    this.setAccessTokenCookie(response, accessToken);
    return { success, message };
  }

  @OpenApiEndpoint({
    options: openApiUpdateAdminEmailOpts.options,
    responses: [
      openApiUpdateAdminEmailOpts.successResponse,
      openApiUpdateAdminEmailOpts.conflictResponse,
      openApiUpdateAdminEmailOpts.badRequestResponse,
      openApiUpdateAdminEmailOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(SchemaDtos.UpdateAdminEmailSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_EMAIL)
  @UseGuards(AdminGuard)
  async updateAdminEmail(
    @Body() body: SchemaDtos.UpdateAdminEmailDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTypes.UpdateAdminEmailResponse> {
    const { accessToken, success } =
      await this.adminService.updateAdminEmail(body);
    this.setAccessTokenCookie(response, accessToken);
    return { success, message: 'Admin email updated successfully' };
  }

  @OpenApiEndpoint({
    options: openApiUpdateAdminPasswordOpts.options,
    responses: [
      openApiUpdateAdminPasswordOpts.successResponse,
      openApiUpdateAdminPasswordOpts.badRequestResponse,
      openApiUpdateAdminPasswordOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(SchemaDtos.UpdateAdminPasswordSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_PASSWORD)
  @UseGuards(AdminGuard)
  async updateAdminPassword(
    @Body() body: SchemaDtos.UpdateAdminPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTypes.UpdateAdminPasswordResponse> {
    const { success, accessToken } =
      await this.adminService.updateAdminPassword(body);
    this.setAccessTokenCookie(response, accessToken);
    return { success, message: 'Admin password updated successfully' };
  }

  @UsePipes(new ZodPipe(SchemaDtos.AdminEmailSchema))
  @Post(ADMIN_ROUTES.SEND_RESET_TOKEN)
  async sendPasswordResetToken(@Body() body: SchemaDtos.GetResetTokenDto) {
    return this.adminService.sendPasswordResetToken(body);
  }

  @UsePipes(new ZodPipe(SchemaDtos.ResetAdminPasswordSchema))
  @Post(ADMIN_ROUTES.RESET_PASSWORD)
  async resetAdminPassword(
    @Body() body: SchemaDtos.ResetAdminPasswordDto,
  ): Promise<ResponseTypes.ResetAdminPasswordResponse> {
    return this.adminService.resetAdminPassword(body);
  }

  @OpenApiEndpoint({
    options: openApiGetAdminProjectsOpts.options,
    responses: [
      openApiGetAdminProjectsOpts.successResponse,
      openApiGetAdminProjectsOpts.notFoundResponse,
    ],
  })
  @Get(ADMIN_ROUTES.GET_PROJECTS)
  @UsePipes(new ZodPipe(SchemaDtos.AdminEmailSchema))
  @UseGuards(AdminGuard)
  async getAdminProjects(
    @Query() query: SchemaDtos.AdminEmailDto,
  ): Promise<ResponseTypes.GetAdminProjectsResponse> {
    return this.adminService.getAdminProjects(query);
  }

  @OpenApiEndpoint({
    options: openApiGetAdminProjectByNameOpts.options,
    responses: [
      openApiGetAdminProjectByNameOpts.successResponse,
      openApiGetAdminProjectByNameOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(SchemaDtos.GetAdminProjectSchema))
  @Get(ADMIN_ROUTES.GET_PROJECT_BY_NAME)
  @UseGuards(AdminGuard)
  async getAdminProjectByName(
    @Body() body: SchemaDtos.GetAdminProjectDto,
  ): Promise<ResponseTypes.GetAdminProjectByNameResponse> {
    return this.adminService.getAdminProjectByName(body);
  }

  @OpenApiEndpoint({
    options: openApiDeleteAdminOpts.options,
    responses: [
      openApiDeleteAdminOpts.successResponse,
      openApiDeleteAdminOpts.notFoundResponse,
    ],
  })
  @Delete(ADMIN_ROUTES.DELETE_ACCOUNT)
  @UseGuards(AdminGuard)
  async deleteAdmin(
    @Query() query: SchemaDtos.AdminEmailDto,
  ): Promise<ResponseTypes.DeleteAdminResponse> {
    return this.adminService.deleteAdmin(query);
  }

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    return response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
