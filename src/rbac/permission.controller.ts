import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import {
  AssignPermissionToRoleDto,
  AssignPermissionToRoleSchema,
  CreatePermissionDto,
  CreatePermissionSchema,
  PermissionIdDo,
  PermissionIdSchema,
  RemovePermissionFromRoleDto,
  RemovePermissionFromRoleSchema,
  UpdatePermissionDto,
  UpdatePermissionSchema,
} from './schema';
import { AdminGuard } from 'src/guard/admin.guard';
import { PERMISSION_ROUTES } from 'src/utils/constants/routes';
import { IdSchema as ProjectIdSchema, IdDto as ProjectIdDto } from 'src/project/schema';

@Controller(PERMISSION_ROUTES.BASE)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post(PERMISSION_ROUTES.CREATE_PERMISSION)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(CreatePermissionSchema))
  async createPermission(@Body() body: CreatePermissionDto) {
    return this.permissionService.createPermission(body);
  }

  @Post(PERMISSION_ROUTES.ASSIGN_TO_ROLE)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(AssignPermissionToRoleSchema))
  async assignPermissionToRole(@Body() body: AssignPermissionToRoleDto) {
    return this.permissionService.assignPermissionToRole(body);
  }

  @Delete(PERMISSION_ROUTES.REMOVE_FROM_ROLE)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(RemovePermissionFromRoleSchema))
  async removePermissionFromRole(@Query() query: RemovePermissionFromRoleDto) {
    return this.permissionService.removePermissionFromRole(query);
  }

  @Get(PERMISSION_ROUTES.GET_DETAILS)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(PermissionIdSchema))
  async getPermission(@Query() query: PermissionIdDo) {
    return this.permissionService.getPermissionDetails(query);
  }

  @Get(PERMISSION_ROUTES.GET_PROJECT_PERMISSIONS)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(ProjectIdSchema))
  async getProjectPermissions(@Query() query: ProjectIdDto) {
    return this.permissionService.getProjectPermissions(query);
  }

  @Put(PERMISSION_ROUTES.UPDATE_PERMISSION)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(UpdatePermissionSchema))
  async updatePermission(@Body() body: UpdatePermissionDto) {
    return this.permissionService.updatePermission(body);
  }

  @Delete(PERMISSION_ROUTES.DELETE_PERMISSION)
  @UseGuards(AdminGuard)
  @UsePipes(new ZodPipe(PermissionIdSchema))
  async deletePermission(@Query() query: PermissionIdDo) {
    return this.permissionService.deletePermission(query);
  }
}
