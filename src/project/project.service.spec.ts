import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { PrismaService } from 'src/infra/db/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import {
  AddUserToProjectDto,
  AssignUserToProjectRoleDto,
  CreateProjectDto,
  IdDto,
  RemoveUserFromProjectDto,
  UpdateProjectNameDto,
  VerifyProjectApiKeysDto,
} from './schema';
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
  let prismaService: PrismaService;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let adminRepository: jest.Mocked<AdminRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;

  const mockUserRepository = {
    getUserById: jest.fn().mockResolvedValue({
      email: faker.internet.email(),
      id: faker.string.uuid(),
      userProjects: [{ projectId: faker.string.uuid(), isVerified: true }],
    }),
  };
  const mockProjectRepository = {
    createProject: jest.fn().mockResolvedValue({
      adminId: faker.string.uuid(),
      name: faker.company.name(),
      id: faker.string.uuid(),
      createdAt: faker.date.past(),
    }),
    updateProject: jest.fn().mockResolvedValue({
      adminId: faker.string.uuid(),
      name: faker.company.name(),
      id: faker.string.uuid(),
      createdAt: faker.date.past(),
    }),
    getProject: jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
      name: faker.company.name(),
      adminId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }),
    getProjectApiKeyByClientKey: jest.fn().mockResolvedValue(faker.string.uuid()),
    getProjectIDByClientKey: jest.fn().mockResolvedValue(faker.string.uuid()),
    getProjectMagicLinks: jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
      name: faker.company.name(),
      adminId: faker.string.uuid(),
      magicLinks: [
        {
          id: faker.string.uuid(),
          user: {
            email: faker.internet.email(),
          },
          createdAt: faker.date.past(),
        },
      ],
    }),
    getProjectRefreshTokens: jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
      name: faker.company.name(),
      adminId: faker.string.uuid(),
      refreshTokens: [
        {
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          createdAt: faker.date.past(),
          userId: faker.string.uuid(),
          state: true,
          authMethod: faker.string.sample(),
        },
      ],
    }),
    getAllProjectsCreatedByAdmin: jest.fn().mockResolvedValue([
      {
        adminId: faker.string.uuid(),
        name: faker.company.name(),
        id: faker.string.uuid(),
        createdAt: faker.date.past(),
      },
    ]),
    deleteProject: jest.fn().mockResolvedValue({
      adminId: faker.string.uuid(),
      name: faker.company.name(),
      id: faker.string.uuid(),
      createdAt: faker.date.past(),
    }),
    addUserToProject: jest.fn().mockResolvedValue({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      user: {
        email: faker.internet.email(),
      },
    }),
    deleteUserFromProject: jest.fn().mockResolvedValue({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      user: {
        email: faker.internet.email(),
      },
    }),
    assignUserProjectRole: jest.fn().mockResolvedValue({
      userId: faker.string.uuid(),
      projectId: faker.string.uuid(),
      roleId: faker.string.uuid(),
    }),
  };

  const mockAdminRepository = {
    getAdminProjectByName: jest.fn(),
    getAdminByID: jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
      email: faker.internet.email(),
    }),
    getAdminByEmail: jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
      email: faker.internet.email(),
    }),
  };

  const mockAppEventEmitter = {
    emit: jest.fn(),
  };

  jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
  }));

  const mockVal = expect.objectContaining({
    mockValue: 'mockValue',
  });
  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: UserRepository, useValue: mockUserRepository },
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
    prismaService = module.get(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prismaService.$disconnect;
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
      const generateKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValue({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      const result = await projectService.createProject(createProjectDto);
      expect(generateKeySpy).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
      expect(result.project.name).toBeDefined();
      expect(result.project.adminId).toBeDefined();
    });

    it('throws a conflict exception when a project with the same name has already been created by an admin with the same id', async () => {
      adminRepository.getAdminProjectByName.mockResolvedValue(
        expect.objectContaining({
          mockVal: 'mockVal',
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
      const result = await projectService.updateProjectName(updateProjectNameDto);
      expect(projectRepository.getProject).toHaveBeenCalledWith(updateProjectNameDto.projectId);
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
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
      projectRepository.getProjectApiKeyByClientKey.mockResolvedValue({
        apiKey: '',
        projectId: '',
      });
      await expect(projectService.verifyProjectApiKeys(verifyProjectApiKeysDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a bad request exception when the api key provided does not match the api key in the DB', async () => {
      projectRepository.getProjectApiKeyByClientKey.mockResolvedValue({
        apiKey: '',
        projectId: '',
      });
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
      projectRepository.getProject.mockResolvedValue(mockVal);
      const generateApiKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValueOnce({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      const generateClientKeySpy = jest.spyOn(projectService, 'generateKey').mockResolvedValueOnce({
        hashedKey: faker.string.uuid(),
        key: faker.string.uuid(),
      });
      projectRepository.updateProject.mockResolvedValue(mockVal);
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
      // projectRepository.getProject.mockResolvedValue(mockVal);
      const result = await projectService.getProjectDetails({ projectId });
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
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
      projectRepository.getProject.mockResolvedValue({
        id: faker.string.uuid(),
        name: faker.company.name(),
        adminId: faker.string.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      });
      const result = await projectService.getProjectMagicLinks({ projectId });
      expect(result.success).toBe(true);
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
      projectRepository.getProject.mockResolvedValue(mockVal);
      // projectRepository.getProjectRefreshTokens.mockResolvedValue(mockVal);
      const result = await projectService.getProjectRefreshTokens({ projectId });
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
    });

    it('throws a not found error when the provided project id does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.getProjectRefreshTokens({ projectId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('get projects created by admin', () => {
    const adminId = faker.string.uuid();
    it('should successfully get the projects created by admin', async () => {
      const result = await projectService.getAllProjectsCreatedByAdmin({ adminId });
      expect(adminRepository.getAdminByID).toHaveBeenCalledWith(adminId);
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
    });

    it('should throw a not found exception when the admin with provided details does not exist', async () => {
      adminRepository.getAdminByID.mockResolvedValue(null);
      await expect(projectService.getAllProjectsCreatedByAdmin({ adminId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete project', () => {
    const projectId = faker.string.uuid();
    it('should successfully delete a project', async () => {
      projectRepository.getProject.mockResolvedValue({
        id: faker.string.uuid(),
        name: faker.company.name(),
        adminId: faker.string.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      });
      const result = await projectService.deleteProject({ projectId });
      expect(projectRepository.getProject).toHaveBeenCalledWith(projectId);
      expect(projectRepository.deleteProject).toHaveBeenCalledWith(projectId);
      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
    });

    it('should throw a not found exception if project with specified ID does not exist', async () => {
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.deleteProject({ projectId })).rejects.toThrow(NotFoundException);
    });
  });

  describe('Add user to project', () => {
    const addUserToProjectDto: AddUserToProjectDto = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      userId: faker.string.uuid(),
      projectId: faker.string.uuid(),
      password: faker.internet.password(),
    };
    it('should successfully add a user to a project', async () => {
      userRepository.getUserById.mockResolvedValue({
        email: faker.internet.email(),
        id: faker.string.uuid(),
        userProjects: [{ projectId: faker.string.uuid(), isVerified: true }],
      });
      projectRepository.getProject.mockResolvedValue(mockVal);
      const result = await projectService.addUserToProject(addUserToProjectDto);
      expect(userRepository.getUserById).toHaveBeenCalledWith(addUserToProjectDto.userId);
      expect(projectRepository.getProject).toHaveBeenCalledWith(addUserToProjectDto.projectId);
      expect(result.success).toBe(true);
      expect(result.userAddedToProject).toBeDefined();
    });

    it('should throw a not found exception when the user cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(projectService.addUserToProject(addUserToProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a not found exception when the project cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(mockVal);
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.addUserToProject(addUserToProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // @project.service.spec.ts

  describe('remove user from project', () => {
    const removeUserFromProjectDto: RemoveUserFromProjectDto = {
      userId: faker.string.uuid(),
      projectId: faker.string.uuid(),
    };

    it('should successfully remove a user from a project', async () => {
      projectRepository.getProject.mockResolvedValue(mockVal);
      projectRepository.deleteUserFromProject.mockResolvedValue(mockVal);
      const result = await projectService.removeUserFromProject(removeUserFromProjectDto);
      expect(projectRepository.getProject).toHaveBeenCalledWith(removeUserFromProjectDto.projectId);
      expect(projectRepository.deleteUserFromProject).toHaveBeenCalledWith(
        removeUserFromProjectDto.userId,
        removeUserFromProjectDto.projectId,
      );
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should throw a not found exception when the user cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(projectService.removeUserFromProject(removeUserFromProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a not found exception when the project cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(mockVal);
      projectRepository.getProject.mockResolvedValue(null);
      await expect(projectService.removeUserFromProject(removeUserFromProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assign user project role', () => {
    const assignUserToProjectRoleDto: AssignUserToProjectRoleDto = {
      userId: faker.string.uuid(),
      projectId: faker.string.uuid(),
      roleId: faker.string.uuid(),
    };

    it('should successfully assign a user to a project role', async () => {
      projectRepository.getProject.mockResolvedValue(mockVal);
      projectRepository.assignUserProjectRole.mockResolvedValue(mockVal);
      const result = await projectService.assignUserProjectRole(assignUserToProjectRoleDto);
      expect(projectRepository.getProject).toHaveBeenCalledWith(
        assignUserToProjectRoleDto.projectId,
      );
      expect(projectRepository.assignUserProjectRole).toHaveBeenCalledWith(
        assignUserToProjectRoleDto.userId,
        assignUserToProjectRoleDto.projectId,
        assignUserToProjectRoleDto.roleId,
      );
      expect(result.success).toBe(true);
      expect(result.userAssignedARole).toBeDefined();
    });

    it('should throw a not found exception when the user cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(
        projectService.assignUserProjectRole(assignUserToProjectRoleDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a not found exception when the project cannot be found', async () => {
      userRepository.getUserById.mockResolvedValue(mockVal);
      projectRepository.getProject.mockResolvedValue(null);
      await expect(
        projectService.assignUserProjectRole(assignUserToProjectRoleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
