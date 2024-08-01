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
import { SkipProjectVerification } from 'src/utils/interceptors/project-verification.interceptor';
import { PROJECT_ROUTES } from 'src/utils/constants/routes';
import {
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
  RemoveUserFromProjectDto,
  RemoveUserFromProjectSchema,
  UpdateProjectNameDto,
  UpdateProjectNameSchema,
  VerifyProjectApiKeysSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';

@Controller(PROJECT_ROUTES.BASE)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(PROJECT_ROUTES.CREATE)
  @UsePipes(new ZodPipe(CreateProjectSchema))
  @SkipProjectVerification()
  @UseGuards(AdminGuard)
  async createProject(@Body() data: CreateProjectDto) {
    return this.projectService.createProject(data);
  }

  @Put(PROJECT_ROUTES.UPDATE_PROJECT_NAME)
  @UsePipes(new ZodPipe(UpdateProjectNameSchema))
  @UseGuards(AdminGuard)
  async updateProjectName(@Body() data: UpdateProjectNameDto) {
    return this.projectService.updateProjectName(data);
  }

  @Get(PROJECT_ROUTES.GET_KEYS)
  @SkipProjectVerification()
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectApiKey(@Query() data: IdDto) {
    return this.projectService.getProjectKeys(data);
  }

  @Get(PROJECT_ROUTES.GET_PROJECT)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProject(@Query() data: IdDto) {
    return this.projectService.getProjectDetails(data);
  }

  @Get(PROJECT_ROUTES.GET_MAGIC_LINKS)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectMagicLinks(@Query() data: IdDto) {
    return this.projectService.getProjectMagicLinks(data);
  }

  @Get(PROJECT_ROUTES.GET_REFRESH_TOKENS)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async getProjectRefreshTokens(@Query() data: IdDto) {
    return this.projectService.getProjectRefreshTokens(data);
  }

  @Get(PROJECT_ROUTES.GET_ALL_BY_ADMIN)
  @UsePipes(new ZodPipe(AdminIdSchema))
  @UseGuards(AdminGuard)
  async getAllProjectsCreatedByAdmin(@Query() data: AdminIdDto) {
    return this.projectService.getAllProjectsCreatedByAdmin(data);
  }

  @Delete(PROJECT_ROUTES.DELETE)
  @UsePipes(new ZodPipe(IdSchema))
  @UseGuards(AdminGuard)
  async deleteProject(@Query() data: IdDto) {
    return this.projectService.deleteProject(data);
  }

  @Post(PROJECT_ROUTES.ADD_USER_TO_PROJECT)
  @UsePipes(new ZodPipe(AddUserToProjectSchema))
  @UseGuards(AdminGuard)
  async addUserToProject(@Body() data: AddUserToProjectDto) {
    return this.projectService.addUserToProject(data);
  }

  @Delete(PROJECT_ROUTES.REMOVE_USER_FROM_PROJECT)
  @UsePipes(new ZodPipe(RemoveUserFromProjectSchema))
  @UseGuards(AdminGuard)
  async removeUserFromProject(@Body() data: RemoveUserFromProjectDto) {
    return this.projectService.removeUserFromProject(data);
  }

  @Post(PROJECT_ROUTES.ASSIGN_USER_PROJECT_ROLE)
  @UsePipes(new ZodPipe(AssignUserProjectRoleSchema))
  @UseGuards(AdminGuard)
  async assignUserProjectRole(@Body() data: AssignUserToProjectRoleDto) {
    return this.projectService.assignUserProjectRole(data);
  }
}
