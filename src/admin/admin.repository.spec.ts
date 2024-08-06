import { Test, TestingModule } from '@nestjs/testing';
import { AdminRepository } from './admin.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('AdminRepository', () => {
  let adminRepository: AdminRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRepository,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            project: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    adminRepository = module.get<AdminRepository>(AdminRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createAdmin', () => {
    it('should create an admin', async () => {
      const mockAdminData: Prisma.AdminCreateInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
      };
      const mockCreatedAdmin = {
        ...mockAdminData,
        id: faker.string.uuid(),
        createdAt: new Date(),
      };
      (prismaService.admin.create as jest.Mock).mockResolvedValue(mockCreatedAdmin);
      const result = await adminRepository.createAdmin(mockAdminData);
      expect(prismaService.admin.create).toHaveBeenCalledWith({
        data: mockAdminData,
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockCreatedAdmin);
    });
  });

  describe('getAdminByEmail', () => {
    it('should get admin details by email', async () => {
      const mockEmail = faker.internet.email();
      const mockAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: mockEmail,
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await adminRepository.getAdminByEmail(mockEmail);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('getAdminByID', () => {
    it('should get admin details by ID', async () => {
      const mockId = faker.string.uuid();
      const mockAdmin = {
        id: mockId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await adminRepository.getAdminByID(mockId);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('getAdminPassword', () => {
    it('should get admin password by email', async () => {
      const mockEmail = faker.internet.email();
      const mockAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: mockEmail,
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await adminRepository.getAdminPassword(mockEmail);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(result).toEqual(mockAdmin.password);
    });
  });

  describe('updateAdmin', () => {
    it('should update an admin', async () => {
      const mockEmail = faker.internet.email();
      const mockAdminData: Prisma.AdminUpdateInput = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
      };
      const mockUpdatedAdmin = {
        ...mockAdminData,
        id: faker.string.uuid(),
        email: mockEmail,
        createdAt: new Date(),
      };
      (prismaService.admin.update as jest.Mock).mockResolvedValue(mockUpdatedAdmin);
      const result = await adminRepository.updateAdmin(mockEmail, mockAdminData);
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { email: mockEmail },
        data: mockAdminData,
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockUpdatedAdmin);
    });
  });

  describe('updateAdminEmail', () => {
    it('should update an admin email', async () => {
      const mockCurrentEmail = faker.internet.email();
      const mockNewEmail = faker.internet.email();
      const mockUpdatedAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: mockNewEmail,
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.update as jest.Mock).mockResolvedValue(mockUpdatedAdmin);

      const result = await adminRepository.updateAdminEmail(mockCurrentEmail, mockNewEmail);

      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { email: mockCurrentEmail },
        data: { email: mockNewEmail },
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockUpdatedAdmin);
    });
  });

  describe('updateAdminPassword', () => {
    it('should update an admin password', async () => {
      const mockEmail = faker.internet.email();
      const mockNewPassword = faker.internet.password();
      const mockUpdatedAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: mockEmail,
        password: mockNewPassword,
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.update as jest.Mock).mockResolvedValue(mockUpdatedAdmin);

      const result = await adminRepository.updateAdminPassword(mockEmail, mockNewPassword);

      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { email: mockEmail },
        data: { password: mockNewPassword },
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockUpdatedAdmin);
    });
  });

  describe('getAdminProjects', () => {
    it('should get admin projects by email', async () => {
      const mockEmail = faker.internet.email();
      const mockAdminProjects = [
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(),
          createdAt: faker.date.anytime(),
        },
        {
          id: faker.string.uuid(),
          name: faker.lorem.words(),
          createdAt: faker.date.anytime(),
        },
      ];

      (prismaService.project.findMany as jest.Mock).mockResolvedValue(mockAdminProjects);

      const result = await adminRepository.getAdminProjects(mockEmail);

      expect(prismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          admin: {
            email: mockEmail,
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockAdminProjects);
    });
  });

  describe('getAdminProjectByName', () => {
    it('should get admin project by name and admin ID', async () => {
      const mockAdminId = faker.string.uuid();
      const mockProjectName = faker.lorem.words();
      const mockAdminProject = {
        id: faker.string.uuid(),
        name: mockProjectName,
        createdAt: faker.date.anytime(),
        logins: [],
        refreshTokens: [],
      };

      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(mockAdminProject);

      const result = await adminRepository.getAdminProjectByName(mockAdminId, mockProjectName);

      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: {
          project_name_admin_id_unique: {
            name: mockProjectName,
            adminId: mockAdminId,
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          logins: true,
          refreshTokens: true,
        },
      });
      expect(result).toEqual(mockAdminProject);
    });
  });

  describe('deleteAdmin', () => {
    it('should delete an admin', async () => {
      const mockEmail = faker.internet.email();
      const mockDeletedAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: mockEmail,
        password: faker.internet.password(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.admin.delete as jest.Mock).mockResolvedValue(mockDeletedAdmin);

      const result = await adminRepository.deleteAdmin(mockEmail);

      expect(prismaService.admin.delete).toHaveBeenCalledWith({
        where: { email: mockEmail },
        select: adminRepository.adminReturnObject,
      });
      expect(result).toEqual(mockDeletedAdmin);
    });
  });
});
