import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from './schema';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(async (fn) => {
              await fn(prismaService);
            }),
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userProject: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const mockUserData: CreateUserDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        projectId: faker.string.uuid(),
        password: faker.internet.password(),
      };
      const mockCreatedUser = {
        ...mockUserData,
        id: faker.string.uuid(),
        createdAt: new Date(),
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      await userRepository.createUser(mockUserData);
      expect(prismaService.$transaction).toHaveBeenCalledWith(expect.any(Function));
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { email: mockUserData.email },
        select: {
          email: true,
          id: true,
        },
      });
      expect(prismaService.userProject.create).toHaveBeenCalledWith({
        data: {
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          projectId: mockUserData.projectId,
          userId: mockCreatedUser.id,
          password: mockCreatedUser.password,
        },
        select: {
          firstName: true,
        },
      });
    });
  });
  describe('updateUserProjectDetails', () => {
    it('should update user details', async () => {
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockUserProjectData: Prisma.UserProjectUpdateInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: faker.datatype.boolean(),
      };
      const mockUpdatedUserProject = {
        ...mockUserProjectData,
        userId: mockUserId,
        projectId: mockProjectId,
      };
      (prismaService.userProject.update as jest.Mock).mockResolvedValue(mockUpdatedUserProject);
      const result = await userRepository.updateUserProjectDetails(
        mockUserId,
        mockProjectId,
        mockUserProjectData,
      );
      expect(prismaService.userProject.update).toHaveBeenCalledWith({
        data: mockUserProjectData,
        where: {
          userId_projectId: {
            userId: mockUserId,
            projectId: mockProjectId,
          },
        },
        select: {
          firstName: true,
          lastName: true,
          isVerified: true,
        },
      });
      expect(result).toEqual(mockUpdatedUserProject);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockEmail = faker.internet.email();
      const mockDeletedUser = {
        email: mockEmail,
        id: faker.string.uuid(),
      };
      (prismaService.userProject.deleteMany as jest.Mock).mockResolvedValue(undefined);
      (prismaService.user.delete as jest.Mock).mockResolvedValue(mockDeletedUser);
      const result = await userRepository.deleteUser(mockEmail);
      expect(prismaService.userProject.deleteMany).toHaveBeenCalledWith({
        where: {
          user: {
            email: mockEmail,
          },
        },
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { email: mockEmail },
        select: {
          email: true,
          id: true,
        },
      });
      expect(result).toEqual(mockDeletedUser);
    });
  });

  describe('getUserProjectDetails', () => {
    it('should get user project details by userId and projectId', async () => {
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockUserProject = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        createdAt: faker.date.anytime(),
        isVerified: faker.datatype.boolean(),
        user: {
          email: faker.internet.email(),
        },
        role: {
          name: faker.lorem.word(),
          id: faker.string.uuid(),
        },
      };
      (prismaService.userProject.findUnique as jest.Mock).mockResolvedValue(mockUserProject);
      const result = await userRepository.getUserProjectDetails(mockUserId, mockProjectId);
      expect(prismaService.userProject.findUnique).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: mockUserId,
            projectId: mockProjectId,
          },
        },
        select: {
          firstName: true,
          lastName: true,
          createdAt: true,
          isVerified: true,
          user: {
            select: {
              email: true,
            },
          },
          role: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUserProject);
    });
  });

  describe('getUserProjectDetailsByEmail', () => {
    it('should get user project details by email and projectId', async () => {
      const mockEmail = faker.internet.email();
      const mockProjectId = faker.string.uuid();
      const mockUserProject = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        createdAt: faker.date.anytime(),
        isVerified: faker.datatype.boolean(),
        user: {
          email: mockEmail,
        },
        role: {
          name: faker.lorem.word(),
          id: faker.string.uuid(),
        },
      };
      (prismaService.userProject.findFirst as jest.Mock).mockResolvedValue(mockUserProject);
      const result = await userRepository.getUserProjectDetailsByEmail(mockEmail, mockProjectId);
      expect(prismaService.userProject.findFirst).toHaveBeenCalledWith({
        where: {
          user: {
            email: mockEmail,
          },
          projectId: mockProjectId,
        },
        select: {
          firstName: true,
          lastName: true,
          createdAt: true,
          isVerified: true,
          user: {
            select: {
              email: true,
            },
          },
          role: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUserProject);
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const mockUserId = faker.string.uuid();
      const mockUser = {
        email: faker.internet.email(),
        id: mockUserId,
        userProjects: [
          {
            projectId: faker.string.uuid(),
            isVerified: faker.datatype.boolean(),
          },
        ],
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await userRepository.getUserById(mockUserId);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: {
          email: true,
          id: true,
          userProjects: {
            select: {
              projectId: true,
              isVerified: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const mockEmail = faker.internet.email();
      const mockUser = {
        email: mockEmail,
        id: faker.string.uuid(),
        userProjects: [
          {
            projectId: faker.string.uuid(),
            isVerified: faker.datatype.boolean(),
          },
        ],
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await userRepository.getUserByEmail(mockEmail);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        select: {
          email: true,
          id: true,
          userProjects: {
            select: {
              projectId: true,
              isVerified: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserPassword', () => {
    it('should get user password by email and projectId', async () => {
      const mockEmail = faker.internet.email();
      const mockProjectId = faker.string.uuid();
      const mockUserProject = {
        password: faker.internet.password(),
      };
      (prismaService.userProject.findFirst as jest.Mock).mockResolvedValue(mockUserProject);
      const result = await userRepository.getUserPassword(mockEmail, mockProjectId);
      expect(prismaService.userProject.findFirst).toHaveBeenCalledWith({
        where: {
          user: {
            email: mockEmail,
          },
          projectId: mockProjectId,
        },
      });
      expect(result).toEqual(mockUserProject.password);
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password by userId and projectId', async () => {
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockNewPassword = faker.internet.password();
      const mockUpdatedUserProject = {
        user: {
          email: faker.internet.email(),
        },
      };
      (prismaService.userProject.update as jest.Mock).mockResolvedValue(mockUpdatedUserProject);
      const result = await userRepository.updateUserPassword(
        mockUserId,
        mockProjectId,
        mockNewPassword,
      );
      expect(prismaService.userProject.update).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: mockUserId,
            projectId: mockProjectId,
          },
        },
        data: { password: mockNewPassword },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUpdatedUserProject);
    });
  });

  describe('updateUserEmail', () => {
    it('should update user email', async () => {
      const mockEmail = faker.internet.email();
      const mockNewEmail = faker.internet.email();
      const mockUpdatedUser = {
        email: mockNewEmail,
        updatedAt: new Date(),
        id: faker.string.uuid(),
      };
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      const result = await userRepository.updateUserEmail(mockEmail, mockNewEmail);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: mockEmail },
        data: { email: mockNewEmail },
        select: {
          email: true,
          updatedAt: true,
          id: true,
        },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('getUserProjects', () => {
    it('should get user projects by email', async () => {
      const mockEmail = faker.internet.email();
      const mockUserProjects = [
        {
          userId: faker.string.uuid(),
          projectId: faker.string.uuid(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isVerified: faker.datatype.boolean(),
        },
      ];
      (prismaService.userProject.findMany as jest.Mock).mockResolvedValue(mockUserProjects);
      const result = await userRepository.getUserProjects(mockEmail);
      expect(prismaService.userProject.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            email: mockEmail,
          },
        },
      });
      expect(result).toEqual(mockUserProjects);
    });
  });
});
