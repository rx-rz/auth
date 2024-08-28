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
import {
  RegisterAdminDto,
  UpdateAdminDto,
  GetAdminProjectDto,
  LoginAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
  RegisterAdminSchema,
  UpdateAdminSchema,
  UpdateAdminEmailSchema,
  UpdateAdminPasswordSchema,
  GetAdminProjectSchema,
  LoginAdminSchema,
  AdminEmailDto,
} from './schema';
import { Response } from 'express';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @UsePipes(new ZodPipe(RegisterAdminSchema))
  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(@Body() body: RegisterAdminDto) {
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
  @UsePipes(new ZodPipe(LoginAdminSchema))
  @Post(ADMIN_ROUTES.LOGIN)
  async loginAdmin(@Body() body: LoginAdminDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, success } = await this.adminService.loginAdmin(body);
    // Set refresh token cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, message: 'Login successful', accessToken };
  }

  @OpenApiEndpoint({
    options: openApiUpdateAdminOpts.options,
    responses: [
      openApiUpdateAdminOpts.successResponse,
      openApiUpdateAdminOpts.badRequestResponse,
      openApiUpdateAdminOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(UpdateAdminSchema))
  @Put(ADMIN_ROUTES.UPDATE_DETAILS)
  @UseGuards(AdminGuard)
  async updateAdmin(@Body() body: UpdateAdminDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, success } = await this.adminService.updateAdmin(body);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, message: 'Admin details updated successfully' };
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
  @UsePipes(new ZodPipe(UpdateAdminEmailSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_EMAIL)
  @UseGuards(AdminGuard)
  async updateAdminEmail(
    @Body() body: UpdateAdminEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, success } = await this.adminService.updateAdminEmail(body);
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
  @UsePipes(new ZodPipe(UpdateAdminPasswordSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_PASSWORD)
  @UseGuards(AdminGuard)
  async updateAdminPassword(@Body() body: UpdateAdminPasswordDto) {
    return this.adminService.updateAdminPassword(body);
  }

  @OpenApiEndpoint({
    options: openApiGetAdminProjectsOpts.options,
    responses: [
      openApiGetAdminProjectsOpts.successResponse,
      openApiGetAdminProjectsOpts.notFoundResponse,
    ],
  })
  @Get(ADMIN_ROUTES.GET_PROJECTS)
  @UseGuards(AdminGuard)
  async getAdminProjects(@Query() query: AdminEmailDto) {
    return this.adminService.getAdminProjects(query);
  }

  @OpenApiEndpoint({
    options: openApiGetAdminProjectByNameOpts.options,
    responses: [
      openApiGetAdminProjectByNameOpts.successResponse,
      openApiGetAdminProjectByNameOpts.notFoundResponse,
    ],
  })
  @UsePipes(new ZodPipe(GetAdminProjectSchema))
  @Get(ADMIN_ROUTES.GET_PROJECT_BY_NAME)
  @UseGuards(AdminGuard)
  async getAdminProjectByName(@Body() body: GetAdminProjectDto) {
    return this.adminService.getAdminProjectByName(body);
  }

  @OpenApiEndpoint({
    options: openApiDeleteAdminOpts.options,
    responses: [openApiDeleteAdminOpts.successResponse, openApiDeleteAdminOpts.notFoundResponse],
  })
  @Delete(ADMIN_ROUTES.DELETE_ACCOUNT)
  @UseGuards(AdminGuard)
  async deleteAdmin(@Query() query: AdminEmailDto) {
    return this.adminService.deleteAdmin(query);
  }

  @Get(ADMIN_ROUTES.LOGOUT)
  @UseGuards(AdminGuard)
  async logoutAdmin(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return { success: true, message: 'Admin logged out successfully' };
  }
}
