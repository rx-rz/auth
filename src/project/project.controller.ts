import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dtos/create-project-dto';
import { UpdateProjectNameDto } from './dtos/update-project-dto';
import { PROJECT_ROUTES } from 'src/utils/constants/routes';
import { AddUserToProjectDto } from './dtos/add-user-to-project-dto';
import { RemoveUserFromProjectDto } from './dtos/remove-user-from-project-dto';
import { AssignUserProjectRole } from './dtos/assign-user-project-role-dto';
import { IDDto } from './dtos/id-dto';

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
  async updateProjectApiKey(@Query() idDto: IDDto) {
    return this.projectService.updateProjectApiKey(idDto.id);
  }

  @Get(PROJECT_ROUTES.GET_API_KEY)
  async getProjectApiKey(@Query() idDto: IDDto) {
    return this.projectService.getProjectApiKey(idDto.id);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  async getProject(@Query() idDto: IDDto) {
    return this.projectService.getProject(idDto.id);
  }

  @Get(PROJECT_ROUTES.GET_MAGIC_LINKS)
  async getProjectMagicLinks(@Query() idDto: IDDto) {
    return this.projectService.getProjectMagicLinks(idDto.id);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  async getProjectRefreshTokens(@Query() idDto: IDDto) {
    return this.projectService.getProjectRefreshTokens(idDto.id);
  }

  @Get(PROJECT_ROUTES.GET_ALL_BY_ADMIN)
  async getAllProjectsCreatedByAdmin(@Query() idDto: IDDto) {
    return this.projectService.getAllProjectsCreatedByAdmin(idDto.id);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  async deleteProject(@Query() idDto: IDDto) {
    return this.projectService.deleteProject(idDto.id);
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
