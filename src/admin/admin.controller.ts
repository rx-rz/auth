import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ROUTES } from 'src/utils/constants/routes';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { UpdateAdminDTO } from './dtos/update-admin-dto';
import { LoginAdminDto } from './dtos/login-admin-dto';
import { Response } from 'express';
import { UpdateAdminEmailDto } from './dtos/update-admin-email-dto';
import { UpdateAdminPasswordDto } from './dtos/update-admin-password-dto';
import { AdminIdDto } from './dtos/admin-id-dto';
import { GetAdminProjectDto } from './dtos/get-admin-project';

@Controller(ADMIN_ROUTES.BASE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    return this.adminService.registerAdmin(data);
  }

  @Put(ADMIN_ROUTES.UPDATE_DETAILS)
  async updateAdmin(@Body() data: UpdateAdminDTO) {
    return this.adminService.updateAdmin(data);
  }

  @Post(ADMIN_ROUTES.LOGIN)
  async loginAdmin(
    @Body() data: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, success } =
      await this.adminService.loginAdmin(data);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, accessToken };
  }

  @Put(ADMIN_ROUTES.UPDATE_ADMIN_EMAIL)
  async updateAdminEmail(@Body() data: UpdateAdminEmailDto) {
    return this.adminService.updateAdminEmail(data);
  }

  @Put(ADMIN_ROUTES.UPDATE_ADMIN_PASSWORD)
  async updateAdminPassword(@Body() data: UpdateAdminPasswordDto) {
    return this.adminService.updateAdminPassword(data);
  }

  @Get(ADMIN_ROUTES.GET_PROJECTS)
  async getAdminProjects(@Query('id') { adminId }: AdminIdDto) {
    return this.adminService.getAdminProjects({ adminId });
  }

  @Get(ADMIN_ROUTES.GET_PROJECT_BY_NAME)
  async getProjectByName(@Body() data: GetAdminProjectDto) {
    return this.adminService.getAdminProjectByName(data);
  }
}
