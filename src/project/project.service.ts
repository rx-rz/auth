import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dtos/create-project-dto';
import { randomBytes } from 'crypto';
import { UpdateProjectNameDto } from './dtos/update-project-dto';
import { AddUserToProjectDto } from './dtos/add-user-to-project-dto';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { RemoveUserFromProjectDto } from './dtos/remove-user-from-project-dto';
import { AssignUserProjectRole } from './dtos/assign-user-project-role-dto';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { compare } from 'bcryptjs';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
  ) {}
  async generateKey() {
    const buffer = randomBytes(32);
    const key = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const hashedKey = await hashValue(key);
    return { hashedKey, key };
  }

  private async getProject(projectId: string) {
    const project = await this.projectRepository.getProject(projectId);
    return project;
  }

  private async checkIfProjectExists(projectId: string) {
    const existingProject = await this.getProject(projectId);
    if (!existingProject) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return existingProject;
  }

  private async ensureAdminExists(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async checkIfUserExists(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  async createProject({ adminId, name }: CreateProjectDto) {
    const projectWithGivenName =
      await this.adminRepository.getAdminProjectByName(adminId, name);
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

  async updateProjectName({ id, name }: UpdateProjectNameDto) {
    await this.checkIfProjectExists(id);
    const project = await this.projectRepository.updateProject(id, { name });
    return { success: true, project };
  }

  async verifyProjectApiKeys(apiKey: string, clientKey: string) {
    const existingApiKeyInDB =
      await this.projectRepository.getProjectApiKeyByClientKey(clientKey);
    const apiKeyIsValid = await compare(apiKey, existingApiKeyInDB);
    return { apiKeyIsValid, existingApiKeyInDB };
  }

  async getProjectKeys(projectId: string) {
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
    return { success: true, projectId };
  }

  async getProjectDetails(projectId: string) {
    await this.checkIfProjectExists(projectId);
    const project = await this.projectRepository.getProject(projectId);
    return { success: true, project };
  }

  async getProjectMagicLinks(projectId: string) {
    await this.checkIfProjectExists(projectId);
    const project =
      await this.projectRepository.getProjectMagicLinks(projectId);
    return { success: true, project };
  }

  async getProjectRefreshTokens(projectId: string) {
    await this.checkIfProjectExists(projectId);
    const project =
      await this.projectRepository.getProjectRefreshTokens(projectId);
    return { success: true, project };
  }

  async getAllProjectsCreatedByAdmin(adminId: string) {
    await this.ensureAdminExists(adminId);
    const project =
      await this.projectRepository.getAllProjectsCreatedByAdmin(adminId);
    return { success: true, project };
  }

  async deleteProject(projectId: string) {
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
    const userAddedToProject = await this.projectRepository.addUserToProject(
      firstName,
      lastName,
      userId,
      projectId,
      password,
    );
    return { success: true, userAddedToProject };
  }

  async removeUserFromProject({ projectId, userId }: RemoveUserFromProjectDto) {
    await this.checkIfUserExists(userId);
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
  }: AssignUserProjectRole) {
    await this.checkIfProjectExists(projectId);
    await this.checkIfUserExists(userId);
    const userAssignedARole =
      await this.projectRepository.assignUserProjectRole(
        userId,
        projectId,
        parseInt(roleId),
      );
    return { success: true, userAssignedARole };
  }
}
