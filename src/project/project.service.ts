import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { randomBytes } from 'crypto';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { compare } from 'bcryptjs';
import {
  AddUserToBlocklistDto,
  AddUserToProjectDto,
  AdminIdDto,
  AssignUserToProjectRoleDto,
  CreateProjectDto,
  ProjectIdDto,
  ProjectSettingsDto,
  RemoveUserFromBlocklistDto,
  RemoveUserFromProjectDto,
  RemoveUserProjectRoleDto,
  UpdateProjectNameDto,
  VerifyProjectApiKeysDto,
} from './schema';
import { Prisma } from '@prisma/client';
import { AdminRepository } from 'src/admin/admin.repository';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async checkIfProjectExists(projectId: string) {
    const existingProject = await this.projectRepository.getProject(projectId);
    if (!existingProject) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return existingProject;
  }

  async checkIfUserExistsInProject(userId: string, projectId: string) {
    const user = await this.projectRepository.getUserFromProject(
      userId,
      projectId,
    );
    if (!user)
      throw new NotFoundException('User with provided details does not exist');
  }

  async getProjectSettings(projectId: string) {
    const projectSettings =
      await this.projectRepository.getProjectSettings(projectId);
    if (!projectSettings) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return projectSettings;
  }

  async manageUserProjectMembership(
    operation: 'add' | 'delete',
    {
      addProps,
      deleteProps,
    }: {
      addProps?: Prisma.UserProjectCreateInput;
      deleteProps?: { userId: string; projectId: string };
    },
  ) {
    let user;
    if (operation === 'add' && addProps) {
      return this.projectRepository.addUserToProject(addProps);
    } else if (operation === 'delete' && deleteProps) {
      return this.projectRepository.deleteUserFromProject(
        deleteProps.userId,
        deleteProps.projectId,
      );
    }
  }

  async handleProjectBlocklistOperation(
    action: 'add' | 'get' | 'remove',
    userId: string,
    projectId: string,
  ) {
    let user;
    if (action === 'add') {
      user = await this.projectRepository.addUserToProjectBlocklist(
        userId,
        projectId,
      );
    } else if (action === 'get') {
      user = await this.projectRepository.getUserFromProjectBlocklist(
        userId,
        projectId,
      );
    } else {
      user = await this.projectRepository.removeUserFromBlocklist(
        userId,
        projectId,
      );
    }
    return user;
  }

  async createProject({ adminId, name }: CreateProjectDto) {
    const adminProject = await this.adminRepository.getAdminProjectByName({
      adminId,
      name,
    });
    const { hashedKey: apiKey, key: clientKey } = await this.generateKey();
    if (adminProject)
      throw new ConflictException(
        'Another project already exists with the same name. Please choose a different name.',
      );
    const project = await this.projectRepository.createProject({
      name,
      admin: {
        connect: { id: adminId },
      },
      apiKey,
      clientKey,
    });
    await this.projectRepository.createProjectSettings(project.id);
    return { success: true, project };
  }

  async updateProjectSettings(dto: ProjectSettingsDto) {
    const { projectId, ...data } = dto;
    const projectSettings = await this.projectRepository.updateProjectSettings(
      projectId,
      data,
    );
    return projectSettings;
  }

  async updateProjectName({ projectId, name }: UpdateProjectNameDto) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.updateProject(projectId, {
      name,
    });
    return { success: true, project };
  }

  async verifyProjectApiKeys({ apiKey, clientKey }: VerifyProjectApiKeysDto) {
    const { apiKey: existingApiKeyInDB, projectId } =
      await this.projectRepository.getProjectApiKeyByClientKey(clientKey);
    if (!existingApiKeyInDB)
      throw new NotFoundException(
        'Project with the provided client key does not exist in the DB',
      );
    const apiKeyIsValid = await compare(apiKey, existingApiKeyInDB);
    if (!apiKeyIsValid)
      throw new BadRequestException('API key provided is not a valid key');
    return { success: true, projectId };
  }

  async getProjectKeys({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const { key: apiKey, hashedKey } = await this.generateKey();
    const { key: clientKey } = await this.generateKey();
    await this.projectRepository.updateProject(projectId, {
      apiKey: hashedKey,
      clientKey,
    });
    return { success: true, clientKey, apiKey };
  }

  async getProjectIDByClientKey(clientKey: string) {
    const projectId =
      await this.projectRepository.getProjectIDByClientKey(clientKey);
    if (!projectId)
      throw new NotFoundException('Project with provided details not found');
    return { success: true, projectId };
  }

  async getProjectDetails({ projectId }: ProjectIdDto) {
    const project = await this.projectRepository.getProjectDetails(projectId);
    return { success: true, project };
  }

  async getProjectRoles({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const roles = await this.projectRepository.getProjectRoles(projectId);
    return { success: true, roles };
  }

  async getProjectRefreshTokens({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const refreshTokens =
      await this.projectRepository.getProjectRefreshTokens(projectId);
    return { success: true, refreshTokens };
  }

  async getAllProjectsCreatedByAdmin({ adminId }: AdminIdDto) {
    const admin = await this.adminRepository.getAdminByID({ adminId });
    if (!admin)
      throw new NotFoundException(
        'Admin with provided details could not be found',
      );
    const projects =
      await this.projectRepository.getAllProjectsCreatedByAdmin(adminId);
    return { success: true, projects };
  }

  async deleteProject({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.deleteProject(projectId);
    return { success: true, project };
  }

  @OnEvent('user.add-to-project')
  @CatchEmitterErrors()
  async addUserToProject({
    projectId,
    userId,
    firstName,
    lastName,
    password,
  }: AddUserToProjectDto) {
    await this.checkIfUserExistsInProject(userId, projectId);
    await this.checkIfProjectExists(projectId);
    const userAddedToProject = await this.projectRepository.addUserToProject({
      firstName,
      lastName,
      user: {
        connect: {
          id: userId,
        },
      },
      project: {
        connect: {
          id: projectId,
        },
      },
      password,
    });
    return { success: true, userAddedToProject };
  }

  async removeUserFromProject({ projectId, userId }: RemoveUserFromProjectDto) {
    await this.checkIfUserExistsInProject(userId, projectId);
    await this.checkIfProjectExists(projectId);
    const user = await this.projectRepository.deleteUserFromProject(
      userId,
      projectId,
    );
    return { success: true, user };
  }

  async assignUserProjectRole({
    projectId,
    roleId,
    userId,
  }: AssignUserToProjectRoleDto) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExistsInProject(userId, projectId);
    const userAssignedARole =
      await this.projectRepository.assignUserProjectRole(
        userId,
        projectId,
        roleId,
      );
    return { success: true, userAssignedARole };
  }

  async addUserToBlocklist({ projectId, userId }: AddUserToBlocklistDto) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExistsInProject(userId, projectId);
    await this.handleProjectBlocklistOperation('add', userId, projectId);
    return { success: true, message: 'User added to blocklist successfully' };
  }

  async removeUserFromBlocklist({
    userId,
    projectId,
  }: RemoveUserFromBlocklistDto) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExistsInProject(userId, projectId);
    await this.handleProjectBlocklistOperation('remove', userId, projectId);
    return { success: true, message: 'User added to blocklist successfully' };
  }

  async getProjectBlocklist({ projectId }: ProjectIdDto) {
    await this.checkIfProjectExists(projectId);
    const blocklist =
      await this.projectRepository.getProjectBlocklist(projectId);
    return blocklist;
  }

  async removeUserProjectRole({
    projectId,
    userId,
    roleId,
  }: RemoveUserProjectRoleDto) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExistsInProject(userId, projectId);
    const userRemovedFromRole =
      await this.projectRepository.removeUserProjectRole(
        userId,
        projectId,
        roleId,
      );
    return { success: true, userRemovedFromRole };
  }

  private async generateKey() {
    const buffer = randomBytes(32);
    const key = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const hashedKey = await hashValue(key);
    return { hashedKey, key };
  }
}
