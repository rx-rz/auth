import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { UserRepository } from './user.repository';
import { ProjectRepository } from 'src/project/project.repository';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

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
    updateUserDetails: jest.fn(),
    deleteUser: jest.fn(),
    getUserProjectDetails: jest.fn(),
    getUserProjectDetailsByEmail: jest.fn(),
  };

  beforeEach(async () => {
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

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('', () => {});
});
