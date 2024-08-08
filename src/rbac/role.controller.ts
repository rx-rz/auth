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
  UsePipes,
  Put,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ROLE_ROUTES } from 'src/utils/constants/routes';
import { AdminGuard } from 'src/guard/admin.guard';
import {
  CreateRoleDto,
  CreateRoleSchema,
  RoleIdDto,
  RoleIDSchema,
  UpdateRoleNameDto,
  UpdateRoleNameSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';

@Controller(ROLE_ROUTES.BASE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post(ROLE_ROUTES.CREATE_ROLE)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(CreateRoleSchema))
  async createRole(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }

  @Get(ROLE_ROUTES.GET_ROLE)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(RoleIDSchema))
  async getRole(@Query() query: RoleIdDto) {
    return this.roleService.getRoleDetails(query);
  }

  @Put(ROLE_ROUTES.UPDATE_ROLE_NAME)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(UpdateRoleNameSchema))
  async updateRoleName(@Body() body: UpdateRoleNameDto) {
    return this.roleService.updateRoleName(body);
  }

  @Delete(ROLE_ROUTES.DELETE_ROLE)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(RoleIDSchema))
  async deleteRole(@Query() query: RoleIdDto) {
    return this.roleService.deleteRole(query);
  }
}
