import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { PrismaService } from 'src/infra/db/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { CreateProjectDto } from './schema';
import { faker } from '@faker-js/faker';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let adminRepository: jest.Mocked<AdminRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;

  const mockProjectRepository = {
    createProject: jest.fn(),
    updateProject: jest.fn(),
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
    getAdminProjectByName: jest.fn().mockReturnValue({
      id: faker.string.uuid,
    }),
  };

  const mockAppEventEmitter = {
    emit: jest.fn(),
  };
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
      expect(projectRepository.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: expect.any(String),
          clientKey: expect.any(String),
          admin: expect.any(Object),
          name: faker.company.name(),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          project: expect.any(Object),
        }),
      );
    });

    // it('throws a conflict exception when a project with the same name has already been created by an admin with the same id', async () => {
    //   adminRepository.getAdminProjectByName.mock({

    //   });
    // });
  });
});
