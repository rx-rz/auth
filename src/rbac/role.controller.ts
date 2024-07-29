import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dtos/create-role-dto';
import { UpdateRoleNameDto } from './dtos/update-role-name-dto';
import { RoleIdDto } from './dtos/role-id-dto';
import { ROLE_ROUTES } from 'src/utils/constants/routes';

@Controller(ROLE_ROUTES.BASE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post(ROLE_ROUTES.CREATE_ROLE)
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }

  @Get(ROLE_ROUTES.GET_ROLE)
  async getRole(@Query() { roleId }: RoleIdDto) {
    return this.roleService.getRoleDetails({ roleId });
  }

  @Get(ROLE_ROUTES.GET_ROLE_PERMISSIONS)
  async getRolePermissions(@Query() { roleId }: RoleIdDto) {
    return this.roleService.getRolePermissions({ roleId });
  }

  @Patch(ROLE_ROUTES.UPDATE_ROLE_NAME)
  async updateRoleName(@Body() body: UpdateRoleNameDto) {
    return this.roleService.updateRoleName({
      newName: body.newName,
      roleId: body.roleId,
    });
  }

  @Delete(ROLE_ROUTES.DELETE_ROLE)
  async deleteRole(@Query() { roleId }: RoleIdDto) {
    return this.roleService.deleteRole({ roleId });
  }
}
