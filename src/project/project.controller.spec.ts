import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
import { faker } from '@faker-js/faker';

describe('Project Controller', () => {
  let projectController: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            createProject: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            updateProjectName: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            getProjectApiKey: jest.fn().mockImplementation(() => {
              return Promise.resolve({
                success: true,
                clientKey: faker.string.uuid(),
                apiKey: faker.string.uuid(),
              });
            }),
            getProjectDetails: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            getProjectKeys: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, apiKey: '', clientKey: '' });
            }),
            getProjectMagicLinks: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            getProjectRefreshTokens: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            getAllProjectsCreatedByAdmin: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            deleteProject: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, project: {} });
            }),
            addUserToProject: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, userAddedToProject: {} });
            }),
            removeUserFromProject: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            assignUserProjectRole: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, userAssignedARole: {} });
            }),
            verifyProjectApiKeys: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, existingApiKeyInDB: {} });
            }),
          },
        },
        ConfigService,
        JwtService,
      ],
    }).compile();
    projectController = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(projectController).toBeDefined();
  });

  describe('Create project', () => {
    const createProjectDto: CreateProjectDto = {
      adminId: faker.string.uuid(),
      name: faker.company.name(),
    };

    it('should successfully create a project', async () => {
      await expect(projectController.createProject(createProjectDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Update project name', () => {
    const updateProjectNameDto: UpdateProjectNameDto = {
      projectId: faker.string.uuid(),
      name: faker.company.name(),
    };
    it('should successfully update a project name', async () => {
      await expect(projectController.updateProjectName(updateProjectNameDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Get project API keys', () => {
    const idDto: IdDto = {
      projectId: faker.string.uuid(),
    };
    it('should successfully get project API keys', async () => {
      await expect(projectController.getProjectApiKey(idDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          clientKey: expect.any(String),
          apiKey: expect.any(String),
        }),
      );
    });
  });

  describe('Get project details', () => {
    const idDto: IdDto = {
      projectId: faker.string.uuid(),
    };
    it('should successfully get project details', async () => {
      await expect(projectController.getProject(idDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Get project magic links', () => {
    const idDto: IdDto = {
      projectId: faker.string.uuid(),
    };
    it('should successfully get project magic links', async () => {
      await expect(projectController.getProjectMagicLinks(idDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Get project refresh tokens', () => {
    const idDto: IdDto = {
      projectId: faker.string.uuid(),
    };
    it('should successfully get project refresh tokens', async () => {
      await expect(projectController.getProjectRefreshTokens(idDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Get all projects created by admin', () => {
    const adminIdDto: AdminIdDto = {
      adminId: faker.string.uuid(),
    };
    it('should successfully get all projects created by admin', async () => {
      await expect(projectController.getAllProjectsCreatedByAdmin(adminIdDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Delete project', () => {
    const idDto: IdDto = {
      projectId: faker.string.uuid(),
    };
    it('should successfully delete a project', async () => {
      await expect(projectController.deleteProject(idDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });
  });

  describe('Add user to project', () => {
    const addUserToProjectDto: AddUserToProjectDto = {
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    };
    it('should successfully add a user to a project', async () => {
      await expect(projectController.addUserToProject(addUserToProjectDto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          userAddedToProject: expect.any(Object),
        }),
      );
    });
  });

  describe('Remove user from project', () => {
    const removeUserFromProjectDto: RemoveUserFromProjectDto = {
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
    };
    it('should successfully remove a user from a project', async () => {
      await expect(
        projectController.removeUserFromProject(removeUserFromProjectDto),
      ).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Assign user project role', () => {
    const assignUserToProjectRoleDto: AssignUserToProjectRoleDto = {
      projectId: faker.string.uuid(),
      roleId: faker.string.uuid(),
      userId: faker.string.uuid(),
    };
    it('should successfully assign a user a role in a project', async () => {
      await expect(
        projectController.assignUserProjectRole(assignUserToProjectRoleDto),
      ).resolves.toEqual(
        expect.objectContaining({
          success: true,
          userAssignedARole: expect.any(Object),
        }),
      );
    });
  });
});
