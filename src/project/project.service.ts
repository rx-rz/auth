import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dtos/create-project-dto';
import { randomBytes } from 'crypto';
import { UpdateProjectNameDto } from './dtos/update-project-dto';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  generateApiKey() {
    const buffer = randomBytes(32);
    const apiKey = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return apiKey;
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const apiKey = this.generateApiKey();
    const project = await this.projectRepository.createProject({
      ...createProjectDto,
      apiKey,
      admin: {
        connect: { id: createProjectDto.adminId },
      },
    });
    return { success: true, project };
  }

  async updateProjectName({ id, name }: UpdateProjectNameDto) {
    const project = await this.projectRepository.updateProject(id, { name });
    return { success: true, project };
  }

  async updateProjectApiKey(id: string) {
    const apiKey = this.generateApiKey();
    const project = await this.projectRepository.updateProject(id, { apiKey });
    return { success: true, project };
  }

  async getProject(id: string) {
    const project = await this.projectRepository.getProject(id);
    return { success: true, project };
  }

  async getProjectMagicLinks(id: string) {
    const project = await this.projectRepository.getProjectMagicLinks(id);
    return { success: true, project };
  }

  async getProjectRefreshTokens(id: string) {
    const project = await this.projectRepository.getProjectRefreshTokens(id);
    return { success: true, project };
  }

  async getAllProjectsCreatedByAdmin(id: string) {
    const project =
      await this.projectRepository.getAllProjectsCreatedByAdmin(id);
    return { success: true, project };
  }

  async deleteProject(id: string) {
    const project = await this.projectRepository.deleteProject(id);
    return { success: true, project };
  }
}
