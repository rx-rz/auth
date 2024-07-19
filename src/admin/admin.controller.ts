import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ROUTES } from 'src/infra/constants/routes';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { UpdateAdminDTO } from './dtos/update-admin-dto';
import { LoginAdminDto } from './dtos/login-admin-dto';
import { Response } from 'express';

@Controller(ADMIN_ROUTES.BASE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('hi')
  async sayHi() {
    return 'Hello World';
  }

  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(@Body() registerAdminDTO: RegisterAdminDTO) {
    return this.adminService.registerAdmin(registerAdminDTO);
  }

  @Put(ADMIN_ROUTES.UPDATE_DETAILS)
  async updateAdmin(@Body() updateAdminDTO: UpdateAdminDTO) {
    return this.adminService.updateAdmin(updateAdminDTO);
  }

  @Post(ADMIN_ROUTES.LOGIN)
  async loginAdmin(
    @Body() loginAdminDTO: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, success, refreshToken } =
      await this.adminService.loginAdmin(loginAdminDTO);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken, success };
  }
}
