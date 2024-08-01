import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ROLE_ROUTES } from 'src/utils/constants/routes';
import { AdminGuard } from 'src/guard/admin.guard';
import { CreateRoleDto, RoleIdDto, UpdateRoleNameDto } from './schema';

@Controller(ROLE_ROUTES.BASE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AdminGuard)
  @Post(ROLE_ROUTES.CREATE_ROLE)
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }
  
  @UseGuards(AdminGuard)
  @Get(ROLE_ROUTES.GET_ROLE)
  async getRole(@Query() { roleId }: RoleIdDto) {
    console.log(roleId)
    return this.roleService.getRoleDetails({ roleId });
  }

  @UseGuards(AdminGuard)
  @Get(ROLE_ROUTES.GET_ROLE_PERMISSIONS)
  async getRolePermissions(@Query() { roleId }: RoleIdDto) {
    return this.roleService.getRolePermissions({ roleId });
  }

  @UseGuards(AdminGuard)
  @Patch(ROLE_ROUTES.UPDATE_ROLE_NAME)
  async updateRoleName(@Body() body: UpdateRoleNameDto) {
    return this.roleService.updateRoleName({
      newName: body.newName,
      roleId: body.roleId,
    });
  }

  @UseGuards(AdminGuard)
  @Delete(ROLE_ROUTES.DELETE_ROLE)
  async deleteRole(@Query() { roleId }: RoleIdDto) {
    return this.roleService.deleteRole({ roleId });
  }
}
