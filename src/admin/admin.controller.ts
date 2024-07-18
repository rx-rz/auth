import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ROUTES } from 'src/infra/constants/routes';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { UpdateAdminDTO } from './dtos/update-admin-dto';

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
}