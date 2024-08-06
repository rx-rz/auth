import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRepository } from './project.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('ProjectRepository', () => {
  let projectRepository: ProjectRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectRepository,
        {
          provide: PrismaService,
          useValue: {
            project: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            userProject: {
              create: jest.fn(),
              delete: jest.fn(),
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    projectRepository = module.get<ProjectRepository>(ProjectRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createProject', () => {
    it('should create a project', async () => {
      const mockAdminId = faker.string.uuid();
      const mockProjectName = faker.lorem.words();
      const mockProjectData: Prisma.ProjectCreateInput = {
        name: mockProjectName,
        admin: {
          connect: {
            id: mockAdminId,
          },
        },
        apiKey: faker.string.uuid(),
        clientKey: faker.string.uuid(),
      };
      const mockCreatedProject = {
        ...mockProjectData,
        id: faker.string.uuid(),
        createdAt: new Date(),
      };
      (prismaService.project.create as jest.Mock).mockResolvedValue(mockCreatedProject);
      const result = await projectRepository.createProject(mockProjectData);
      expect(prismaService.project.create).toHaveBeenCalledWith({
        data: mockProjectData,
        select: {
          adminId: true,
          name: true,
          id: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProjectData: Prisma.ProjectUpdateInput = {
        name: faker.lorem.words(),
      };
      const mockUpdatedProject = {
        ...mockProjectData,
        id: mockProjectId,
        adminId: faker.string.uuid(),
        createdAt: new Date(),
      };
      (prismaService.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject);
      const result = await projectRepository.updateProject(mockProjectId, mockProjectData);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        data: mockProjectData,
        where: { id: mockProjectId },
        select: {
          adminId: true,
          name: true,
          id: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('getProjectApiKeys', () => {
    it('should get project api keys', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProject = {
        apiKey: faker.string.uuid(),
        clientKey: faker.string.uuid(),
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProjectApiKeys(mockProjectId);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        select: {
          apiKey: true,
          clientKey: true,
        },
      });
      expect(result).toEqual({
        apiKey: mockProject.apiKey,
        clientKey: mockProject.clientKey,
      });
    });
  });

  describe('getProjectIDByClientKey', () => {
    it('should get project ID by client key', async () => {
      const mockClientKey = faker.string.uuid();
      const mockProject = {
        id: faker.string.uuid(),
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProjectIDByClientKey(mockClientKey);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { clientKey: mockClientKey },
        select: {
          id: true,
        },
      });
      expect(result).toEqual(mockProject.id);
    });
  });

  describe('getProjectApiKeyByClientKey', () => {
    it('should get project api key by client key', async () => {
      const mockClientKey = faker.string.uuid();
      const mockProject = {
        apiKey: faker.string.uuid(),
        id: faker.string.uuid(),
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProjectApiKeyByClientKey(mockClientKey);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { clientKey: mockClientKey },
        select: {
          apiKey: true,
          id: true,
        },
      });
      expect(result).toEqual({
        apiKey: mockProject.apiKey,
        projectId: mockProject.id,
      });
    });
  });

  describe('getProject', () => {
    it('should get project by ID', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProject = {
        id: mockProjectId,
        name: faker.lorem.words(),
        adminId: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProject(mockProjectId);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        select: {
          id: true,
          name: true,
          adminId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('getProjectUsers', () => {
    it('should get project users', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProjectUsers = [
        {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isVerified: faker.datatype.boolean(),
          createdAt: new Date(),
          role: {
            name: faker.lorem.words(),
            id: faker.string.uuid(),
          },
        },
        {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isVerified: faker.datatype.boolean(),
          createdAt: new Date(),
          role: {
            name: faker.lorem.words(),
            id: faker.string.uuid(),
          },
        },
      ];
      (prismaService.userProject.findMany as jest.Mock).mockResolvedValue(mockProjectUsers);
      const result = await projectRepository.getProjectUsers(mockProjectId);
      expect(prismaService.userProject.findMany).toHaveBeenCalledWith({
        where: { projectId: mockProjectId },
        select: {
          firstName: true,
          lastName: true,
          isVerified: true,
          createdAt: true,
          role: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProjectUsers);
    });
  });

  describe('getProjectMagicLinks', () => {
    it('should get project magic links', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProject = {
        id: mockProjectId,
        name: faker.lorem.words(),
        adminId: faker.string.uuid(),
        magicLinks: [
          {
            id: faker.string.uuid(),
            user: {
              email: faker.internet.email(),
            },
            createdAt: new Date(),
          },
          {
            id: faker.string.uuid(),
            user: {
              email: faker.internet.email(),
            },
            createdAt: new Date(),
          },
        ],
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProjectMagicLinks(mockProjectId);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        select: {
          id: true,
          name: true,
          adminId: true,
          magicLinks: {
            select: {
              id: true,
              user: {
                select: { email: true },
              },
              createdAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('getProjectRefreshTokens', () => {
    it('should get project refresh tokens', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProject = {
        id: mockProjectId,
        name: faker.lorem.words(),
        adminId: faker.string.uuid(),
        refreshTokens: [
          {
            token: faker.string.uuid(),
            expiresAt: new Date(),
            createdAt: new Date(),
            userId: faker.string.uuid(),
            state: 'ACTIVE',
            authMethod: 'EMAIL_AND_PASSWORD_SIGNIN',
          },
          {
            token: faker.string.uuid(),
            expiresAt: new Date(),
            createdAt: new Date(),
            userId: faker.string.uuid(),
            state: 'ACTIVE',
            authMethod: 'EMAIL_AND_PASSWORD_SIGNIN',
          },
        ],
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      const result = await projectRepository.getProjectRefreshTokens(mockProjectId);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        select: {
          id: true,
          name: true,
          adminId: true,
          refreshTokens: {
            select: {
              token: true,
              expiresAt: true,
              createdAt: true,
              userId: true,
              state: true,
              authMethod: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('getAllProjectsCreatedByAdmin', () => {
    it('should get all projects created by admin', async () => {
      const mockAdminId = faker.string.uuid();
      const mockProjects = [
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(),
          adminId: mockAdminId,
          createdAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(),
          adminId: mockAdminId,
          createdAt: new Date(),
        },
      ];
      (prismaService.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      const result = await projectRepository.getAllProjectsCreatedByAdmin(mockAdminId);
      expect(prismaService.project.findMany).toHaveBeenCalledWith({
        where: { adminId: mockAdminId },
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockProjectId = faker.string.uuid();
      const mockDeletedProject = {
        id: mockProjectId,
        name: faker.lorem.words(),
        adminId: faker.string.uuid(),
        createdAt: new Date(),
      };
      (prismaService.project.delete as jest.Mock).mockResolvedValue(mockDeletedProject);
      const result = await projectRepository.deleteProject(mockProjectId);
      expect(prismaService.project.delete).toHaveBeenCalledWith({
        where: { id: mockProjectId },
      });
      expect(result).toEqual(mockDeletedProject);
    });
  });

  describe('addUserToProject', () => {
    it('should add a user to a project', async () => {
      const mockFirstName = faker.person.firstName();
      const mockLastName = faker.person.lastName();
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockPassword = faker.internet.password();
      const mockUser = {
        firstName: mockFirstName,
        lastName: mockLastName,
        user: {
          email: faker.internet.email(),
        },
      };
      (prismaService.userProject.create as jest.Mock).mockResolvedValue(mockUser);
      const result = await projectRepository.addUserToProject(
        mockFirstName,
        mockLastName,
        mockUserId,
        mockProjectId,
        mockPassword,
      );
      expect(prismaService.userProject.create).toHaveBeenCalledWith({
        data: {
          firstName: mockFirstName,
          lastName: mockLastName,
          userId: mockUserId,
          projectId: mockProjectId,
          password: mockPassword,
        },
        select: {
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUserFromProject', () => {
    it('should delete a user from a project', async () => {
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        user: {
          email: faker.internet.email(),
        },
      };
      (prismaService.userProject.delete as jest.Mock).mockResolvedValue(mockUser);
      const result = await projectRepository.deleteUserFromProject(mockUserId, mockProjectId);
      expect(prismaService.userProject.delete).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            projectId: mockProjectId,
            userId: mockUserId,
          },
        },
        select: {
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProjectRoles', () => {
    it('should get project roles', async () => {
      const mockProjectId = faker.string.uuid();
      const mockProjectRoles = {
        name: faker.lorem.words(),
        id: mockProjectId,
        createdAt: new Date(),
        roles: [
          {
            name: faker.lorem.words(),
            id: faker.string.uuid(),
            createdAt: new Date(),
          },
          {
            name: faker.lorem.words(),
            id: faker.string.uuid(),
            createdAt: new Date(),
          },
        ],
      };
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockProjectRoles);
      const result = await projectRepository.getProjectRoles(mockProjectId);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProjectId },
        select: {
          name: true,
          id: true,
          createdAt: true,
          roles: {
            select: {
              name: true,
              id: true,
              createdAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProjectRoles);
    });
  });

  describe('assignUserProjectRole', () => {
    it('should assign a user project role', async () => {
      const mockUserId = faker.string.uuid();
      const mockProjectId = faker.string.uuid();
      const mockRoleId = faker.string.uuid();
      const mockUserAssignedARole = {
        userId: mockUserId,
        projectId: mockProjectId,
        roleId: mockRoleId,
        firstName: '',
        lastName: '',
      };
      (prismaService.userProject.upsert as jest.Mock).mockResolvedValue(mockUserAssignedARole);
      const result = await projectRepository.assignUserProjectRole(
        mockUserId,
        mockProjectId,
        mockRoleId,
      );
      expect(prismaService.userProject.upsert).toHaveBeenCalledWith({
        where: {
          userId_projectId: {
            userId: mockUserId,
            projectId: mockProjectId,
          },
        },
        update: {
          roleId: mockRoleId,
        },
        create: {
          userId: mockUserId,
          projectId: mockProjectId,
          roleId: mockRoleId,
          firstName: '',
          lastName: '',
        },
      });
      expect(result).toEqual(mockUserAssignedARole);
    });
  });
});
