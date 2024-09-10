import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AdminGuard } from 'src/guard/admin.guard';

import { PROJECT_ROUTES } from 'src/utils/constants/routes';
import {
  AddUserToBlocklistDto,
  AddUserToProjectDto,
  AddUserToProjectSchema,
  AdminIdDto,
  AdminIdSchema,
  AssignUserProjectRoleSchema,
  AssignUserToProjectRoleDto,
  CreateProjectDto,
  CreateProjectSchema,
  IdDto,
  IdSchema,
  ProjectSettingsDto,
  ProjectSettingsSchema,
  RemoveUserFromBlocklistDto,
  RemoveUserFromBlocklistSchema,
  RemoveUserFromProjectDto,
  RemoveUserFromProjectSchema,
  RemoveUserProjectRoleDto,
  UpdateProjectNameDto,
  UpdateProjectNameSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';

@Controller(PROJECT_ROUTES.BASE)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(PROJECT_ROUTES.CREATE)
  @UsePipes(new ZodPipe(CreateProjectSchema))
  @UseGuards(AdminGuard)
  async createProject(@Body() body: CreateProjectDto) {
    return this.projectService.createProject(body);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_NAME)
  @UsePipes(new ZodPipe(UpdateProjectNameSchema))
  @UseGuards(AdminGuard)
  async updateProjectName(@Body() body: UpdateProjectNameDto) {
    return this.projectService.updateProjectName(body);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_SETTINGS)
  @UsePipes(new ZodPipe(ProjectSettingsSchema))
  @UseGuards(AdminGuard)
  async updateProjectSettings(@Body() body: ProjectSettingsDto) {
    return this.projectService.updateProjectSettings(body);
  }

  @Get(PROJECT_ROUTES.GET_KEYS)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectApiKey(@Query() query: IdDto) {
    return this.projectService.getProjectKeys(query);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProject(@Query() query: IdDto) {
    return this.projectService.getProjectDetails(query);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT_ROLES)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectRoles(@Query() query: IdDto) {
    return this.projectService.getProjectRoles(query);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectRefreshTokens(@Query() query: IdDto) {
    return this.projectService.getProjectRefreshTokens(query);
  }

  @Get(PROJECT_ROUTES.GET_ADMIN_PROJECTS)
  @UsePipes(new ZodPipe(AdminIdSchema))
  @UseGuards(AdminGuard)
  async getAllProjectsCreatedByAdmin(@Query() query: AdminIdDto) {
    return this.projectService.getAllProjectsCreatedByAdmin(query);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async deleteProject(@Query() query: IdDto) {
    return this.projectService.deleteProject(query);
  }

  @Post(PROJECT_ROUTES.ADD_USER_TO_PROJECT)
  @UsePipes(new ZodPipe(AddUserToProjectSchema))
  @UseGuards(AdminGuard)
  async addUserToProject(@Body() body: AddUserToProjectDto) {
    return this.projectService.addUserToProject(body);
  }

  @Post(PROJECT_ROUTES.ADD_USER_TO_BLOCKLIST)
  @UsePipes(new ZodPipe(AddUserToProjectSchema))
  @UseGuards(AdminGuard)
  async addUserToBlocklist(@Body() body: AddUserToBlocklistDto) {
    return this.projectService.addUserToBlocklist(body);
  }

  @Post(PROJECT_ROUTES.REMOVE_USER_FROM_BLOCKLIST)
  @UsePipes(new ZodPipe(RemoveUserFromBlocklistSchema))
  @UseGuards(AdminGuard)
  async removeUserFromBlocklist(@Body() body: RemoveUserFromBlocklistDto) {
    return this.projectService.removeUserFromBlocklist(body);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT_BLOCKLIST)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectBlocklist(@Body() body: RemoveUserFromBlocklistDto) {
    return this.projectService.getProjectBlocklist(body);
  }

  @Post(PROJECT_ROUTES.ASSIGN_USER_PROJECT_ROLE)
  @UsePipes(new ZodPipe(AssignUserProjectRoleSchema))
  @UseGuards(AdminGuard)
  async assignUserProjectRole(@Body() body: AssignUserToProjectRoleDto) {
    return this.projectService.assignUserProjectRole(body);
  }

  @Post(PROJECT_ROUTES.REMOVE_USER_FROM_PROJECT_ROLE)
  @UsePipes(new ZodPipe(RemoveUserFromProjectSchema))
  @UseGuards(AdminGuard)
  async removeUserFromProjectRole(@Body() body: RemoveUserProjectRoleDto) {
    return this.projectService.removeUserProjectRole(body);
  }

  @Delete(PROJECT_ROUTES.REMOVE_USER_FROM_PROJECT)
  @UsePipes(new ZodPipe(RemoveUserFromProjectSchema))
  @UseGuards(AdminGuard)
  async removeUserFromProject(@Body() body: RemoveUserFromProjectDto) {
    return this.projectService.removeUserFromProject(body);
  }
}
