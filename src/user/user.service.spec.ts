import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { UserRepository } from './user.repository';
import { ProjectRepository } from 'src/project/project.repository';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from './schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let emitter: jest.Mocked<AppEventEmitter>;

  const mockAppEventEmitter = {
    emit: jest.fn(),
  };

  const mockProjectRepository = {
    getProject: jest.fn(),
  };

  const mockUserRepository = {
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
    getUserPassword: jest.fn(),
    updateUserPassword: jest.fn(),
    updateUserEmail: jest.fn(),
    getUserProjects: jest.fn(),
    createUser: jest.fn(),
    updateUserProjectDetails: jest.fn(),
    deleteUser: jest.fn(),
    getUserProjectDetails: jest.fn(),
    getUserProjectDetailsByEmail: jest.fn(),
  };

  const userResolvedFromMock = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    userProjects: [],
  };

  const projectResolvedFromMock = {
    id: faker.string.uuid(),
    adminId: faker.string.uuid(),
    createdAt: faker.date.anytime(),
    name: faker.company.name(),
    updatedAt: faker.date.anytime(),
  };

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AppEventEmitter,
          useValue: mockAppEventEmitter,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ProjectRepository,
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    projectRepository = module.get(ProjectRepository);
    emitter = module.get(AppEventEmitter);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const dto: CreateUserDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      projectId: faker.string.uuid(),
    };

    it('should successfully create a new user when the user does not exist', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      projectRepository.getProject.mockResolvedValue({
        id: dto.projectId,
        adminId: faker.string.uuid(),
        createdAt: faker.date.anytime(),
        name: faker.company.name(),
        updatedAt: faker.date.anytime(),
      });
      userRepository.createUser;
      const result = await service.createUser(dto);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(projectRepository.getProject).toHaveBeenCalledWith(dto.projectId);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          password: expect.any(String),
        }),
      );
      expect(result).toBeUndefined();
    });

    it('should successfully add a user to a project when the user exists but is not assigned to the project', async () => {
      userRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      projectRepository.getProject.mockResolvedValue(projectResolvedFromMock);
      userRepository.getUserProjectDetailsByEmail.mockResolvedValue(null);
      projectRepository.addUserToProject.mockResolvedValue({
        firstName: userResolvedFromMock.firstName,
        lastName: userResolvedFromMock.lastName,
        user: {
          email: userResolvedFromMock.email,
        },
      });

      const result = await service.createUser(dto);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(projectRepository.getProject).toHaveBeenCalledWith(dto.projectId);
      expect(userRepository.getUserProjectDetailsByEmail).toHaveBeenCalledWith(
        dto.email,
        dto.projectId,
      );
      expect(projectRepository.addUserToProject).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          userId: userResolvedFromMock.id,
        }),
      );
      expect(result).toBeUndefined();
    });

    it('should throw a conflict exception when the user exists and is already assigned to the project', async () => {
      userRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      projectRepository.getProject.mockResolvedValue(projectResolvedFromMock);
      userRepository.getUserProjectDetailsByEmail.mockResolvedValue({
        createdAt: faker.date.anytime(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: faker.datatype.boolean(),
        role: {
          id: faker.string.uuid(),
          name: faker.commerce.department(),
        },
        user: {
          email: faker.internet.email(),
        },
      });

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(projectRepository.getProject).toHaveBeenCalledWith(dto.projectId);
      expect(userRepository.getUserProjectDetailsByEmail).toHaveBeenCalledWith(
        dto.email,
        dto.projectId,
      );
    });

    it('should throw a not found exception when the project does not exist', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      projectRepository.getProject.mockResolvedValue(null);

      await expect(service.createUser(dto)).rejects.toThrow(NotFoundException);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(projectRepository.getProject).toHaveBeenCalledWith(dto.projectId);
    });
  });
});
