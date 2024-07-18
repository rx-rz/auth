import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_ROUTES } from 'src/constants/routes';
import { RegisterAdminDTO } from './dtos/register-admin-dto';

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
}
