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

@ApiTags('admin')
@Controller(ADMIN_ROUTES.BASE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    ...openApiRegisterAdminOpts.options,
  })
  @ApiResponse({ ...openApiRegisterAdminOpts.successResponse })
  @ApiResponse({ ...openApiRegisterAdminOpts.conflictResponse })
  @UsePipes(new ZodPipe(RegisterAdminSchema))
  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(@Body() body: RegisterAdminDto) {
    return this.adminService.registerAdmin(body);
  }

  @ApiOperation({
    ...openApiLoginAdminOpts.options,
  })
  @ApiResponse({ ...openApiLoginAdminOpts.successResponse })
  @ApiResponse({ ...openApiLoginAdminOpts.unauthorizedResponse })
  @ApiResponse({ ...openApiLoginAdminOpts.notFoundResponse })
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

  @ApiOperation({ ...openApiUpdateAdminOpts.options })
  @ApiResponse({ ...openApiUpdateAdminOpts.successResponse })
  @ApiResponse({ ...openApiUpdateAdminOpts.badRequestResponse })
  @ApiResponse({ ...openApiUpdateAdminOpts.notFoundResponse })
  @UsePipes(new ZodPipe(UpdateAdminSchema))
  @Put(ADMIN_ROUTES.UPDATE_DETAILS)
  @UseGuards(AdminGuard)
  async updateAdmin(@Body() body: UpdateAdminDto) {
    return this.adminService.updateAdmin(body);
  }

  @ApiOperation({ ...openApiUpdateAdminEmailOpts.options })
  @ApiResponse({ ...openApiUpdateAdminEmailOpts.successResponse })
  @ApiResponse({ ...openApiUpdateAdminEmailOpts.conflictResponse })
  @ApiResponse({ ...openApiUpdateAdminEmailOpts.badRequestResponse })
  @ApiResponse({ ...openApiUpdateAdminEmailOpts.notFoundResponse })
  @UsePipes(new ZodPipe(UpdateAdminEmailSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_EMAIL)
  @UseGuards(AdminGuard)
  async updateAdminEmail(@Body() body: UpdateAdminEmailDto) {
    return this.adminService.updateAdminEmail(body);
  }

  @ApiOperation({ ...openApiUpdateAdminPasswordOpts.options })
  @ApiResponse({ ...openApiUpdateAdminPasswordOpts.successResponse })
  @ApiResponse({ ...openApiUpdateAdminPasswordOpts.badRequestResponse })
  @ApiResponse({ ...openApiUpdateAdminPasswordOpts.notFoundResponse })
  @UsePipes(new ZodPipe(UpdateAdminPasswordSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_PASSWORD)
  @UseGuards(AdminGuard)
  async updateAdminPassword(@Body() body: UpdateAdminPasswordDto) {
    return this.adminService.updateAdminPassword(body);
  }

  @ApiOperation({ ...openApiGetAdminProjectsOpts.options })
  @ApiOperation({ ...openApiGetAdminProjectsOpts.successResponse })
  @ApiOperation({ ...openApiGetAdminProjectsOpts.notFoundResponse })
  @Get(ADMIN_ROUTES.GET_PROJECTS)
  @UseGuards(AdminGuard)
  async getAdminProjects(@Query() query: AdminEmailDto) {
    return this.adminService.getAdminProjects(query);
  }

  @ApiOperation({ ...openApiGetAdminProjectByNameOpts.options })
  @ApiOperation({ ...openApiGetAdminProjectByNameOpts.successResponse })
  @ApiOperation({ ...openApiGetAdminProjectByNameOpts.notFoundResponse })
  @UsePipes(new ZodPipe(GetAdminProjectSchema))
  @Get(ADMIN_ROUTES.GET_PROJECT_BY_NAME)
  @UseGuards(AdminGuard)
  async getAdminProjectByName(@Body() body: GetAdminProjectDto) {
    return this.adminService.getAdminProjectByName(body);
  }

  @ApiOperation({ ...openApiDeleteAdminOpts.options })
  @ApiOperation({ ...openApiDeleteAdminOpts.successResponse })
  @ApiOperation({ ...openApiDeleteAdminOpts.notFoundResponse })
  @Delete(ADMIN_ROUTES.DELETE_ACCOUNT)
  @UseGuards(AdminGuard)
  async deleteAdmin(@Query() query: AdminEmailDto) {
    return this.adminService.deleteAdmin(query);
  }
}
