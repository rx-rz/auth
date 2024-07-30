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
import { SkipProjectVerification } from 'src/utils/interceptors/project-verification.interceptor';

@Controller(PROJECT_ROUTES.BASE)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(PROJECT_ROUTES.CREATE)
  @SkipProjectVerification()
  @UseGuards(AdminGuard)
  async createProject(@Body() data: CreateProjectDto) {
    return this.projectService.createProject(data);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_NAME)
  @UseGuards(AdminGuard)
  async updateProjectName(@Body() data: UpdateProjectNameDto) {
    return this.projectService.updateProjectName(data);
  }

  @SkipProjectVerification()
  @Get(PROJECT_ROUTES.GET_KEYS)
  @UseGuards(AdminGuard)
  async getProjectApiKey(@Query() { projectId }: IDDto) {
    return this.projectService.getProjectKeys(projectId);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  @UseGuards(AdminGuard)
  async getProject(@Query() { projectId }: IDDto) {
    return this.projectService.getProjectDetails(projectId);
  }

  @Get(PROJECT_ROUTES.GET_MAGIC_LINKS)
  @UseGuards(AdminGuard)
  async getProjectMagicLinks(@Query() { projectId }: IDDto) {
    return this.projectService.getProjectMagicLinks(projectId);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  @UseGuards(AdminGuard)
  async getProjectRefreshTokens(@Query() { projectId }: IDDto) {
    return this.projectService.getProjectRefreshTokens(projectId);
  }

  @Get(PROJECT_ROUTES.GET_ALL_BY_ADMIN)
  @UseGuards(AdminGuard)
  async getAllProjectsCreatedByAdmin(@Query() { projectId }: IDDto) {
    return this.projectService.getAllProjectsCreatedByAdmin(projectId);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  @UseGuards(AdminGuard)
  async deleteProject(@Query() { projectId }: IDDto) {
    return this.projectService.deleteProject(projectId);
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
