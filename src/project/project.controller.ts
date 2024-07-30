import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dtos/create-project-dto';
import { UpdateProjectNameDto } from './dtos/update-project-dto';
import { PROJECT_ROUTES } from 'src/utils/constants/routes';
import { AddUserToProjectDto } from './dtos/add-user-to-project-dto';
import { RemoveUserFromProjectDto } from './dtos/remove-user-from-project-dto';
import { AssignUserProjectRole } from './dtos/assign-user-project-role-dto';
import { IDDto } from './dtos/id-dto';
import { AdminGuard } from 'src/guard/admin.guard';
import { SkipProjectId } from 'src/utils/interceptors/project-verification.interceptor';

@Controller(PROJECT_ROUTES.BASE)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(PROJECT_ROUTES.CREATE)
  @SkipProjectId()
  @UseGuards(AdminGuard)
  async createProject(@Body() data: CreateProjectDto) {
    return this.projectService.createProject(data);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_NAME)
  @UseGuards(AdminGuard)
  async updateProjectName(@Body() data: UpdateProjectNameDto) {
    return this.projectService.updateProjectName(data);
  }

  @SkipProjectId()
  @Get(PROJECT_ROUTES.GET_KEYS)
  @UseGuards(AdminGuard)
  async getProjectApiKey(@Query() {id}: IDDto) {
    
    return this.projectService.getProjectKeys(id);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  @UseGuards(AdminGuard)
  async getProject(@Query() {id}: IDDto) {
    return this.projectService.getProjectDetails(id);
  }

  @Get(PROJECT_ROUTES.GET_MAGIC_LINKS)
  @UseGuards(AdminGuard)
  async getProjectMagicLinks(@Query() {id}: IDDto) {
    return this.projectService.getProjectMagicLinks(id);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  @UseGuards(AdminGuard)
  async getProjectRefreshTokens(@Query() {id}: IDDto) {
    return this.projectService.getProjectRefreshTokens(id);
  }

  @Get(PROJECT_ROUTES.GET_ALL_BY_ADMIN)
  @UseGuards(AdminGuard)
  async getAllProjectsCreatedByAdmin(@Query() {id}: IDDto) {
    return this.projectService.getAllProjectsCreatedByAdmin(id);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  @UseGuards(AdminGuard)
  async deleteProject(@Query() {id}: IDDto) {
    return this.projectService.deleteProject(id);
  }

  @Post(PROJECT_ROUTES.ADD_USER_TO_PROJECT)
  @UseGuards(AdminGuard)
  async addUserToProject(@Body() addUserToProjectDto: AddUserToProjectDto) {
    return this.projectService.addUserToProject(addUserToProjectDto);
  }

  @Delete(PROJECT_ROUTES.REMOVE_USER_FROM_PROJECT)
  @UseGuards(AdminGuard)
  async removeUserFromProject(
    @Body() removeUserFromProjectDto: RemoveUserFromProjectDto,
  ) {
    return this.projectService.removeUserFromProject(removeUserFromProjectDto);
  }

  @Post(PROJECT_ROUTES.ASSIGN_USER_PROJECT_ROLE)
  @UseGuards(AdminGuard)
  async assignUserProjectRole(
    @Body() assignUserProjectRoleDto: AssignUserProjectRole,
  ) {
    return this.projectService.assignUserProjectRole(assignUserProjectRoleDto);
  }
}
