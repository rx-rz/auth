import { Test, TestingModule } from '@nestjs/testing';
import { AdminRepository } from './admin.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
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

  it('should be defined', () => {
    expect(adminRepository).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should create an admin', async () => {
      const mockAdmin = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: faker.datatype.boolean(),
      };

      (prismaService.admin.create as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await adminRepository.createAdmin(mockAdmin);
      console.log(await adminRepository.createAdmin(mockAdmin));
      expect(prismaService.admin.create).toHaveBeenCalledWith({
        data: mockAdmin,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          mfaEnabled: true,
        },
      });
      expect(result).toEqual({ ...mockAdmin, id: faker.string.uuid() });
    });
  });

  describe('getAdminByEmail', () => {
    it('should get an admin by email', async () => {
      const email = faker.internet.email();
      const returnedAdmin = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
      };
      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(
        returnedAdmin,
      );
      const result = await adminRepository.getAdminByEmail({ email });
      expect(result).toEqual(returnedAdmin);
      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          mfaEnabled: true,
        },
      });
    });
  });

  describe('getAdminByID', () => {
    it('should get an admin by ID', async () => {
      const adminId = faker.string.uuid();
      const mockAdmin = {
        id: adminId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
      };
      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(
        mockAdmin,
      );
      const result = await adminRepository.getAdminByID({ adminId });
      expect(result).toEqual(mockAdmin);
      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { id: adminId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          mfaEnabled: true,
        },
      });
    });
  });

  describe('getAdminPassword', () => {
    it('should get an admin password by email', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(password);
      const result = await adminRepository.getAdminPassword({ email });
      expect(result).toEqual(password);
      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('updateAdmin', () => {
    it('should update an admin', async () => {
      const email = faker.internet.email();
      const updateData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: true,
        mfaEnabled: true,
      };
      const mockAdmin = {
        id: faker.string.uuid(),
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email,
        isVerified: updateData.isVerified,
        mfaEnabled: updateData.mfaEnabled,
      };

      (prismaService.admin.update as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await adminRepository.updateAdmin({
        email,
        ...updateData,
      });
      expect(result).toEqual(mockAdmin);
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { email },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          mfaEnabled: true,
        },
      });
    });
  });

  describe('updateAdminEmail', () => {
    it('should update an admin email', async () => {
      const currentEmail = faker.internet.email();
      const newEmail = faker.internet.email();
      const mockAdmin = {
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: newEmail,
        isVerified: faker.datatype.boolean(),
        mfaEnabled: faker.datatype.boolean(),
      };

      (prismaService.admin.update as jest.Mock).mockResolvedValue(mockAdmin)
      const result = await adminRepository.updateAdminEmail({
        currentEmail,
        newEmail,
      });
      expect(result).toEqual(mockAdmin);
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { email: currentEmail },
        data: { email: newEmail },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isVerified: true,
          mfaEnabled: true,
        },
      });
    });
  });

  // describe('updateAdminPassword', () => {
  //   it('should update an admin password', async () => {
  //     const email = faker.internet.email();
  //     const newPassword = faker.internet.password();
  //     const mockAdmin = {
  //       id: faker.string.uuid(),
  //       firstName: faker.person.firstName(),
  //       lastName: faker.person.lastName(),
  //       email,
  //       isVerified: faker.datatype.boolean(),
  //       mfaEnabled: faker.datatype.boolean(),
  //     };

  //     jest.spyOn(prismaService.admin, 'update').mockResolvedValue(mockAdmin);

  //     const result = await adminRepository.updateAdminPassword({
  //       email,
  //       newPassword,
  //     });
  //     expect(result).toEqual(mockAdmin);
  //     expect(prismaService.admin.update).toHaveBeenCalledWith({
  //       where: { email },
  //       data: { password: newPassword },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         isVerified: true,
  //         mfaEnabled: true,
  //       },
  //     });
  //   });
  // });

  // describe('getAdminProjects', () => {
  //   it('should get an admin projects', async () => {
  //     const email = faker.internet.email();
  //     const mockAdminProjects = [
  //       {
  //         id: faker.string.uuid(),
  //         name: faker.lorem.word(),
  //         createdAt: faker.date.past(),
  //         updatedAt: faker.date.recent(),
  //       },
  //     ];

  //     jest
  //       .spyOn(prismaService.project, 'findMany')
  //       .mockResolvedValue(mockAdminProjects);

  //     const result = await adminRepository.getAdminProjects({ email });
  //     expect(result).toEqual(mockAdminProjects);
  //     expect(prismaService.project.findMany).toHaveBeenCalledWith({
  //       where: {
  //         admin: {
  //           email,
  //         },
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //         updatedAt: true,
  //         createdAt: true,
  //       },
  //     });
  //   });
  // });

  // describe('getAdminWebAuthnCredentials', () => {
  //   it('should get an admin webAuthn credentials', async () => {
  //     const email = faker.internet.email();
  //     const mockCredentials = [
  //       {
  //         id: faker.string.uuid(),
  //         credentialId: faker.string.uuid(),
  //         publicKey: faker.string.alphanumeric(),
  //         createdAt: faker.date.past(),
  //         updatedAt: faker.date.recent(),
  //       },
  //     ];

  //     jest
  //       .spyOn(prismaService.webAuthnCredential, 'findMany')
  //       .mockResolvedValue(mockCredentials);

  //     const result = await adminRepository.getAdminWebAuthnCredentials({
  //       email,
  //     });
  //     expect(result).toEqual(mockCredentials);
  //     expect(prismaService.webAuthnCredential.findMany).toHaveBeenCalledWith({
  //       where: {
  //         admin: { email },
  //       },
  //     });
  //   });
  // });

  // describe('getAdminProjectByName', () => {
  //   it('should get an admin project by name', async () => {
  //     const adminId = faker.string.uuid();
  //     const name = faker.lorem.word();
  //     const mockAdminProject = {
  //       id: faker.string.uuid(),
  //       name,
  //       createdAt: faker.date.past(),
  //       updatedAt: faker.date.recent(),
  //       logins: [],
  //       refreshTokens: [],
  //     };

  //     jest
  //       .spyOn(prismaService.project, 'findUnique')
  //       .mockResolvedValue(mockAdminProject);

  //     const result = await adminRepository.getAdminProjectByName({
  //       adminId,
  //       name,
  //     });
  //     expect(result).toEqual(mockAdminProject);
  //     expect(prismaService.project.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         project_name_admin_id_unique: {
  //           name,
  //           adminId,
  //         },
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //         createdAt: true,
  //         logins: true,
  //         refreshTokens: true,
  //       },
  //     });
  //   });
  // });

  // describe('deleteAdmin', () => {
  //   it('should delete an admin', async () => {
  //     const email = faker.internet.email();
  //     const mockAdmin = {
  //       id: faker.string.uuid(),
  //       firstName: faker.person.firstName(),
  //       lastName: faker.person.lastName(),
  //       email,
  //       isVerified: faker.datatype.boolean(),
  //       mfaEnabled: faker.datatype.boolean(),
  //     };

  //     jest.spyOn(prismaService.admin, 'delete').mockResolvedValue(mockAdmin);

  //     const result = await adminRepository.deleteAdmin({ email });
  //     expect(result).toEqual(mockAdmin);
  //     expect(prismaService.admin.delete).toHaveBeenCalledWith({
  //       where: { email },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         isVerified: true,
  //         mfaEnabled: true,
  //       },
  //     });
  //   });
  // });
});
