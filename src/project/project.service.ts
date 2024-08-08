import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { randomBytes } from 'crypto';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { compare } from 'bcryptjs';

import {
  AddUserToProjectDto,
  AdminIdDto,
  AssignUserToProjectRoleDto,
  CreateProjectDto,
  IdDto,
  RemoveUserFromProjectDto,
  UpdateProjectNameDto,
  VerifyProjectApiKeysDto,
} from './schema';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
  ) {}
  async generateKey() {
    const buffer = randomBytes(32);
    const key = buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const hashedKey = await hashValue(key);
    return { hashedKey, key };
  }

  private async checkIfProjectExists(projectId: string) {
    const existingProject = await this.projectRepository.getProject(projectId);
    if (!existingProject) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return existingProject;
  }

  private async checkIfUserExists(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  async createProject({ adminId, name }: CreateProjectDto) {
    const projectWithGivenName = await this.adminRepository.getAdminProjectByName(adminId, name);
    const { hashedKey: apiKey, key: clientKey } = await this.generateKey();
    if (projectWithGivenName)
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
    return { success: true, project };
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
      throw new NotFoundException('Project with the provided client key does not exist in the DB');
    const apiKeyIsValid = await compare(apiKey, existingApiKeyInDB);
    if (!apiKeyIsValid) throw new BadRequestException('API key provided is not a valid key');
    return { success: true, projectId };
  }

  async getProjectKeys({ projectId }: IdDto) {
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
    const projectId = await this.projectRepository.getProjectIDByClientKey(clientKey);
    if (!projectId) throw new NotFoundException('Project with provided details not found');
    return { success: true, projectId };
  }

  async getProjectDetails({ projectId }: IdDto) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.getProject(projectId);
    return { success: true, project };
  }

  async getProjectMagicLinks({ projectId }: IdDto) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.getProjectMagicLinks(projectId);
    return { success: true, project };
  }

  async getProjectRefreshTokens({ projectId }: IdDto) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.getProjectRefreshTokens(projectId);
    return { success: true, project };
  }

  async getAllProjectsCreatedByAdmin({ adminId }: AdminIdDto) {
    const admin = await this.adminRepository.getAdminByID(adminId);
    if (!admin) throw new NotFoundException('Admin with provided details could not be found');
    const project = await this.projectRepository.getAllProjectsCreatedByAdmin(adminId);
    return { success: true, project };
  }

  async deleteProject({ projectId }: IdDto) {
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
    await this.checkIfUserExists(userId);
    await this.checkIfProjectExists(projectId);
    const userAddedToProject = await this.projectRepository.addUserToProject({
      firstName,
      lastName,
      userId,
      projectId,
      password,
    });
    return { success: true, userAddedToProject };
  }

  async removeUserFromProject({ projectId, userId }: RemoveUserFromProjectDto) {
    await this.checkIfUserExists(userId);
    await this.checkIfProjectExists(projectId);
    const user = await this.projectRepository.deleteUserFromProject(userId, projectId);
    return { success: true, user };
  }

  async assignUserProjectRole({ projectId, roleId, userId }: AssignUserToProjectRoleDto) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExists(userId);
    const userAssignedARole = await this.projectRepository.assignUserProjectRole(
      userId,
      projectId,
      roleId,
    );
    return { success: true, userAssignedARole };
  }
}
