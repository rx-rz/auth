import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { PrismaService } from 'src/infra/db/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { CreateProjectDto, IdDto, UpdateProjectNameDto, VerifyProjectApiKeysDto } from './schema';
import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let adminRepository: jest.Mocked<AdminRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;

  const mockProjectRepository = {
    createProject: jest.fn(),
    updateProject: jest.fn(),
    getProject: jest.fn(),
    getProjectApiKeyByClientKey: jest.fn(),
    getProjectIDByClientKey: jest.fn(),
    getProjectMagicLinks: jest.fn(),
    getProjectRefreshTokens: jest.fn(),
    getAllProjectsCreatedByAdmin: jest.fn(),
    deleteProject: jest.fn(),
    addUserToProject: jest.fn(),
    deleteUserFromProject: jest.fn(),
    assignUserProjectRole: jest.fn(),
  };

  const mockAdminRepository = {
    getAdminProjectByName: jest.fn(),
  };

  const mockAppEventEmitter = {
    emit: jest.fn(),
  };

  jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
  }));
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        UserRepository,
        { provide: AdminRepository, useValue: mockAdminRepository },
        { provide: ProjectRepository, useValue: mockProjectRepository },
        {
          provide: AppEventEmitter,
          useValue: mockAppEventEmitter,
        },
        PrismaService,
        EventEmitter2,
      ],
    }).compile();
    projectService = module.get<ProjectService>(ProjectService);
    projectRepository = module.get(ProjectRepository);
    userRepository = module.get(UserRepository);
    adminRepository = module.get(AdminRepository);
    appEventEmitter = module.get(AppEventEmitter);
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('create project', () => {
    const createProjectDto: CreateProjectDto = {
      adminId: faker.string.uuid(),
      name: faker.company.name(),
    };

    it('successfully creates a project', async () => {
      adminRepository.getAdminProjectByName.mockResolvedValue(null);
      const generateKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValue({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      projectRepository.createProject.mockResolvedValue({
        id: faker.string.uuid(),
        name: faker.company.name(),
        createdAt: faker.date.recent(),
        adminId: faker.string.uuid(),
      });
      const result = await projectService.createProject(createProjectDto);
      expect(generateKeySpy).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });

    it('throws a conflict exception when a project with the same name has already been created by an admin with the same id', async () => {
      adminRepository.getAdminProjectByName.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
      await expect(projectService.createProject(createProjectDto)).rejects.toThrow(
        ConflictException,
      );
      expect(adminRepository.getAdminProjectByName).toHaveBeenCalledWith(
        createProjectDto.adminId,
        createProjectDto.name,
      );
    });
  });

  describe('update project name', () => {
    const updateProjectNameDto: UpdateProjectNameDto = {
      name: faker.company.name(),
      projectId: faker.string.uuid(),
    };

    it("should successfully update a project's name", async () => {
      projectRepository.getProject.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
      projectRepository.updateProject.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
      const result = await projectService.updateProjectName(updateProjectNameDto);
      expect(result).toEqual({
        success: true,
        project: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      });
    });

    it('should throw a not found error when a project with the provided details does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.updateProjectName(updateProjectNameDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(projectRepository.getProject).toHaveBeenCalledWith(updateProjectNameDto.projectId);
    });
  });

  describe('verify project api keys', () => {
    const verifyProjectApiKeysDto: VerifyProjectApiKeysDto = {
      apiKey: faker.string.uuid(),
      clientKey: faker.string.uuid(),
    };

    it("should successfullly verify a project's api keys", async () => {
      projectRepository.getProjectApiKeyByClientKey.mockResolvedValue(faker.string.uuid());
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      const result = await projectService.verifyProjectApiKeys(verifyProjectApiKeysDto);
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          existingApiKeyInDB: expect.any(String),
        }),
      );
    });

    it('should throw a not found exception when an inexistent client key is provided', async () => {
      projectRepository.getProjectApiKeyByClientKey.mockResolvedValue(null);
      await expect(projectService.verifyProjectApiKeys(verifyProjectApiKeysDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a bad request exception when the api key provided does not match the api key in the DB', async () => {
      projectRepository.getProjectApiKeyByClientKey.mockResolvedValue(faker.string.uuid());
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      await expect(projectService.verifyProjectApiKeys(verifyProjectApiKeysDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('get project keys', () => {
    const projectId = faker.string.uuid();
    it('should successfully get project keys', async () => {
      projectRepository.getProject.mockResolvedValue(
        expect.objectContaining({
          id: projectId,
        }),
      );
      const generateApiKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValueOnce({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      const generateClientKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValueOnce({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      projectRepository.updateProject.mockResolvedValue(
        expect.objectContaining({
          id: projectId,
        }),
      );
      const result = await projectService.getProjectKeys({ projectId });
      expect(generateApiKeySpy).toHaveBeenCalled();
      expect(generateClientKeySpy).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          apiKey: expect.any(String),
        }),
      );
    });
  });

  describe('get project id by client key', () => {
    const clientKey = faker.string.uuid();

    it('should successfully get project ID by client key', async () => {
      const projectId = faker.string.uuid();
      projectRepository.getProjectIDByClientKey.mockResolvedValue(faker.string.uuid());

      const result = await projectService.getProjectIDByClientKey(clientKey);
      expect(result).toEqual({
        success: true,
        projectId: expect.any(String),
      });
    });

    it('should throw a not found exception when the client key does not exist', async () => {
      projectRepository.getProjectIDByClientKey.mockResolvedValue(null);
      await expect(projectService.getProjectIDByClientKey(clientKey)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('get project details', () => {
    const projectId = faker.string.uuid();

    it('should successfully get project details', async () => {
      projectRepository.getProject.mockResolvedValue(
        expect.objectContaining({
          id: projectId,
        }),
      );

      const result = await projectService.getProjectDetails({ projectId });
      expect(result).toEqual({
        success: true,
        project: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      });
    });

    it('should throw a not found exception when the project does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.getProjectDetails({ projectId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('get project magic links', () => {
    const projectId = faker.string.uuid();

    it('should successfully get project magic links', async () => {
      projectRepository.getProjectMagicLinks.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
          magicLinks: expect.arrayContaining(
            expect.objectContaining({
              id: expect.any(String),
            }),
          ),
        }),
      );

      const result = await projectService.getProjectMagicLinks({ projectId });
      expect(result).toEqual({
        success: true,
        project: expect.objectContaining({
          id: expect.any(String),
          magicLinks: expect.arrayContaining(
            expect.objectContaining({
              id: faker.string.uuid(),
            }),
          ),
        }),
      });
    });

    it('should throw a not found exception when the project does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.getProjectMagicLinks({ projectId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('get project refresh tokens', () => {
    const projectId = faker.string.uuid();
    it('successfully get project refresh tokens', async () => {
      projectRepository.getProject.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
        }),
      );
      projectRepository.getProjectRefreshTokens.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          adminId: expect.any(String),
          refreshTokens: expect.arrayContaining([
            expect.objectContaining({
              token: expect.any(String),
              expiresAt: expect.any(Date),
              createdAt: expect.any(Date),
              userId: expect.any(String),
              state: expect.any(String),
              authMethod: expect.any(String),
            }),
          ]),
        }),
      );
      const result = await projectService.getProjectRefreshTokens({ projectId });
      expect(result).toEqual({
        success: true,
        project: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          adminId: expect.any(String),
          refreshTokens: expect.arrayContaining([
            expect.objectContaining({
              token: expect.any(String),
              expiresAt: expect.any(Date),
              createdAt: expect.any(Date),
              userId: expect.any(String),
              state: expect.any(String),
              authMethod: expect.any(String),
            }),
          ]),
        }),
      });
    });

    it('throws a not found error when the provided project id does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.getProjectRefreshTokens({ projectId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
