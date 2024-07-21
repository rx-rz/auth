import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dtos/create-project-dto';
import { UpdateProjectNameDto } from './dtos/update-project-dto';
import { PROJECT_ROUTES } from 'src/utils/constants/routes';
import { AddUserToProjectDto } from './dtos/add-user-to-project-dto';
import { RemoveUserFromProjectDto } from './dtos/remove-user-from-project-dto';
import { AssignUserProjectRole } from './dtos/assign-user-project-role-dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(PROJECT_ROUTES.CREATE)
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_NAME)
  async updateProjectName(@Body() updateProjectName: UpdateProjectNameDto) {
    return this.projectService.updateProjectName(updateProjectName);
  }

  @Put(PROJECT_ROUTES.UPDATE_API_KEY)
  async updateProjectApiKey(@Param('id') id: string) {
    return this.projectService.updateProjectApiKey(id);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  async getProject(@Param('id') id: string) {
    return this.projectService.getProject(id);
  }

  @Get(PROJECT_ROUTES.GET_MAGIC_LINKS)
  async getProjectMagicLinks(@Param('id') id: string) {
    return this.projectService.getProjectMagicLinks(id);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  async getProjectRefreshTokens(@Param('id') id: string) {
    return this.projectService.getProjectRefreshTokens(id);
  }

  @Get(PROJECT_ROUTES.GET_ALL_BY_ADMIN)
  async getAllProjectsCreatedByAdmin(@Param('id') id: string) {
    return this.projectService.getAllProjectsCreatedByAdmin(id);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  async deleteProject(@Param('id') id: string) {
    return this.projectService.deleteProject(id);
  }

  @Post(PROJECT_ROUTES.ADD_USER_TO_PROJECT)
  async addUserToProject(@Body() addUserToProjectDto: AddUserToProjectDto) {
    return this.projectService.addUserToProject(addUserToProjectDto);
  }

  @Delete(PROJECT_ROUTES.REMOVE_USER_FROM_PROJECT)
  async removeUserFromProject(
    @Body() removeUserFromProjectDto: RemoveUserFromProjectDto,
  ) {
    return this.projectService.removeUserFromProject(removeUserFromProjectDto);
  }

  @Post(PROJECT_ROUTES.ASSIGN_USER_PROJECT_ROLE)
  async assignUserProjectRole(
    @Body() assignUserProjectRoleDto: AssignUserProjectRole,
  ) {
    return this.projectService.assignUserProjectRole(assignUserProjectRoleDto);
  }
}
