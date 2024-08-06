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
  AdminIdDto,
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

@Controller(ADMIN_ROUTES.BASE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UsePipes(new ZodPipe(RegisterAdminSchema))
  @Post(ADMIN_ROUTES.REGISTER)
  async registerAdmin(@Body() data: RegisterAdminDto) {
    return this.adminService.registerAdmin(data);
  }

  @UsePipes(new ZodPipe(LoginAdminSchema))
  @Post(ADMIN_ROUTES.LOGIN)
  async loginAdmin(@Body() data: LoginAdminDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, success } = await this.adminService.loginAdmin(data);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success, accessToken };
  }

  @UsePipes(new ZodPipe(UpdateAdminSchema))
  @Put(ADMIN_ROUTES.UPDATE_DETAILS)
  @UseGuards(AdminGuard)
  async updateAdmin(@Body() data: UpdateAdminDto) {
    return this.adminService.updateAdmin(data);
  }

  @UsePipes(new ZodPipe(UpdateAdminEmailSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_EMAIL)
  @UseGuards(AdminGuard)
  async updateAdminEmail(@Body() data: UpdateAdminEmailDto) {
    return this.adminService.updateAdminEmail(data);
  }

  @UsePipes(new ZodPipe(UpdateAdminPasswordSchema))
  @Put(ADMIN_ROUTES.UPDATE_ADMIN_PASSWORD)
  @UseGuards(AdminGuard)
  async updateAdminPassword(@Body() data: UpdateAdminPasswordDto) {
    return this.adminService.updateAdminPassword(data);
  }

  @Get(ADMIN_ROUTES.GET_PROJECTS)
  @UseGuards(AdminGuard)
  async getAdminProjects(@Query() { email }: AdminEmailDto) {
    return this.adminService.getAdminProjects({ email });
  }

  @UsePipes(new ZodPipe(GetAdminProjectSchema))
  @Get(ADMIN_ROUTES.GET_PROJECT_BY_NAME)
  @UseGuards(AdminGuard)
  async getAdminProjectByName(@Body() data: GetAdminProjectDto) {
    return this.adminService.getAdminProjectByName(data);
  }

  @Delete(ADMIN_ROUTES.DELETE_ACCOUNT)
  @UseGuards(AdminGuard)
  async deleteAdmin(@Query() data: AdminEmailDto) {
    console.log('test');
    return this.adminService.deleteAdmin(data);
  }
}
