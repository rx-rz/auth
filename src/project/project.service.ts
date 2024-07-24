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
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  generateApiKey() {
    const buffer = randomBytes(32);
    const apiKey = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return apiKey;
  }

  private async checkIfProjectExists(projectId: string) {
    const existingProject = await this.projectRepository.getProject(projectId);
    if (!existingProject) {
      throw new NotFoundException('Project with specified ID does not exist.');
    }
    return existingProject;
  }

  private async checkIfAdminExists(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async checkIfUserExists(email: string) {
    const user = await this.userRepository.getUserDetails(email);
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const apiKey = this.generateApiKey();
    const projectWithGivenNameAlreadyExists =
      await this.adminRepository.getAdminProjectByName(
        createProjectDto.adminId,
        createProjectDto.name,
      );
    if (projectWithGivenNameAlreadyExists)
      throw new ConflictException(
        'Another project already exists with the same name. Please choose a different name.',
      );
    const project = await this.projectRepository.createProject({
      name: createProjectDto.name,
      apiKey,
      admin: {
        connect: { id: createProjectDto.adminId },
      },
    });
    return { success: true, project };
  }

  async updateProjectName({ id, name }: UpdateProjectNameDto) {
    await this.checkIfProjectExists(id);
    const project = await this.projectRepository.updateProject(id, { name });
    return { success: true, project };
  }

  async updateProjectApiKey(projectId: string) {
    await this.checkIfProjectExists(projectId);
    const apiKey = this.generateApiKey();
    const project = await this.projectRepository.updateProject(projectId, {
      apiKey,
    });
    return { success: true, project };
  }

  async getProjectApiKey(projectId: string) {
    await this.checkIfProjectExists(projectId);
    const apiKey = await this.projectRepository.getProjectApiKey(projectId);
    return { success: true, apiKey };
  }

  async getProject(projectId: string) {
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
    await this.checkIfAdminExists(adminId);
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
      await hashValue(password || ''),
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
