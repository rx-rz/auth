import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { LoginAdminDto, RegisterAdminDto, UpdateAdminDto } from './schema';
import { faker } from '@faker-js/faker';
import {
  LoginAdminResponse,
  LogoutAdminResponse,
  RegisterAdminResponse,
  UpdateAdminEmailResponse,
  UpdateAdminResponse,
} from './response-types';

describe('Admin Controller', () => {
  let adminController: AdminController;
  let adminService: AdminService;

  let mockResponse: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            registerAdmin: jest.fn(),
            loginAdmin: jest.fn(),
            logoutAdmin: jest.fn(),
            updateAdmin: jest.fn(),
            updateAdminEmail: jest.fn(),
            updateAdminPassword: jest.fn(),
            resetAdminPassword: jest.fn(),
            getAdminProjects: jest.fn(),
            getAdminProjectByName: jest.fn(),
            deleteAdmin: jest.fn(),
          },
        },
        JwtService,
        ConfigService,
        RefreshTokenService,
        RefreshTokenRepository,
        PrismaService,
      ],
    }).compile();

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    adminController = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(adminController).toBeDefined();
  });

  describe('registerAdmin', () => {
    it('should register an admin', async () => {
      const registerAdminDto: RegisterAdminDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const response = {
        success: true,
        message: 'Admin registered successfully',
      };

      jest.spyOn(adminService, 'registerAdmin').mockResolvedValue(response);

      const result: RegisterAdminResponse =
        await adminController.registerAdmin(registerAdminDto);
      expect(result).toEqual(response);
      expect(adminService.registerAdmin).toHaveBeenCalledWith(registerAdminDto);
    });
  });

  describe('loginAdmin', () => {
    it('should login an admin and set cookies', async () => {
      const loginAdminDto: LoginAdminDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const mockLoginResult = {
        success: true,
        accessToken: faker.string.alphanumeric({ length: 100 }),
        refreshToken: faker.string.uuid(),
      };

      jest.spyOn(adminService, 'loginAdmin').mockResolvedValue(mockLoginResult);

      const result: LoginAdminResponse = await adminController.loginAdmin(
        loginAdminDto,
        mockResponse,
      );
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        accessToken: mockLoginResult.accessToken,
      });
      expect(adminService.loginAdmin).toHaveBeenCalledWith(loginAdminDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('logoutAdmin', () => {
    it('should logout an admin and clear cookies', async () => {
      const result: LogoutAdminResponse =
        await adminController.logoutAdmin(mockResponse);
      expect(result).toEqual({
        success: true,
        message: 'Admin logged out successfully',
      });
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateAdmin', () => {
    it('should update an admin and set cookies', async () => {
      const updateAdminDto: UpdateAdminDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        isVerified: true,
        mfaEnabled: true,
      };
      const mockUpdateResult = {
        success: true,
        accessToken: faker.string.alphanumeric({ length: 100 }),
        message: 'Admin details updated successfully',
      };

      jest
        .spyOn(adminService, 'updateAdmin')
        .mockResolvedValue(mockUpdateResult);

      const result: UpdateAdminResponse = await adminController.updateAdmin(
        updateAdminDto,
        mockResponse,
      );
      expect(result).toEqual({
        success: true,
        message: 'Admin details updated successfully',
      });
      expect(adminService.updateAdmin).toHaveBeenCalledWith(updateAdminDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAdminEmail', () => {
    it('should update an admin email and set cookies', async () => {
      const updateAdminEmailDto = {
        currentEmail: faker.internet.email(),
        newEmail: faker.internet.email(),
        password: faker.internet.password(),
      };
      const mockUpdateResult = {
        success: true,
        admin: {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          id: faker.string.uuid(),
          isVerified: faker.datatype.boolean(),
          mfaEnabled: faker.datatype.boolean(),
        },
        accessToken: faker.string.alphanumeric({ length: 100 }),
      };

      jest
        .spyOn(adminService, 'updateAdminEmail')
        .mockResolvedValue(mockUpdateResult);

      const result: UpdateAdminEmailResponse =
        await adminController.updateAdminEmail(
          updateAdminEmailDto,
          mockResponse,
        );
      expect(result).toEqual({
        success: true,
        message: 'Admin email updated successfully',
      });
      expect(adminService.updateAdminEmail).toHaveBeenCalledWith(
        updateAdminEmailDto,
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAdminPassword', () => {
    it('should update an admin password and set cookies', async () => {
      const updateAdminPasswordDto = {
        email: faker.internet.email(),
        currentPassword: faker.internet.password(),
        newPassword: faker.internet.password(),
      };

      const mockUpdateResult = {
        success: true,
        accessToken: faker.string.alphanumeric({ length: 100 }),
      };

      jest
        .spyOn(adminService, 'updateAdminPassword')
        .mockResolvedValue(mockUpdateResult);

      const result = await adminController.updateAdminPassword(
        updateAdminPasswordDto,
        mockResponse,
      );
      expect(result).toEqual({
        success: true,
        message: 'Admin password updated successfully',
      });
      expect(adminService.updateAdminPassword).toHaveBeenCalledWith(
        updateAdminPasswordDto,
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetAdminPassword', () => {
    it('should reset an admin password', async () => {
      const resetAdminPasswordDto = {
        email: faker.internet.email(),
        newPassword: faker.internet.password(),
      };
      const mockResetResult = {
        success: true,
        message: 'Admin password reset successfully',
      };

      jest
        .spyOn(adminService, 'resetAdminPassword')
        .mockResolvedValue(mockResetResult);

      const result = await adminController.resetAdminPassword(
        resetAdminPasswordDto,
      );
      expect(result).toEqual(mockResetResult);
      expect(adminService.resetAdminPassword).toHaveBeenCalledWith(
        resetAdminPasswordDto,
      );
    });
  });

  describe('getAdminProjects', () => {
    it('should get an admin projects', async () => {
      const adminEmailDto = {
        email: faker.internet.email(),
      };
      const mockGetProjectsResult = {
        success: true,
        adminProjects: [
          {
            id: faker.string.uuid(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            name: faker.lorem.word(),
          },
        ],
      };

      jest
        .spyOn(adminService, 'getAdminProjects')
        .mockResolvedValue(mockGetProjectsResult);

      const result = await adminController.getAdminProjects(adminEmailDto);
      expect(result).toEqual(mockGetProjectsResult);
      expect(adminService.getAdminProjects).toHaveBeenCalledWith(adminEmailDto);
    });
  });

  // describe('getAdminProjectByName', () => {
  //   it('should get an admin project by name', async () => {
  //     const getAdminProjectDto = {
  //       adminId: faker.string.uuid(),
  //       name: faker.lorem.word(),
  //     };
  //     const mockGetProjectResult = {
  //       // ... (add the expected response structure here)
  //     };

  //     jest
  //       .spyOn(adminService, 'getAdminProjectByName')
  //       .mockResolvedValue(mockGetProjectResult);

  //     const result =
  //       await adminController.getAdminProjectByName(getAdminProjectDto);
  //     expect(result).toEqual(mockGetProjectResult);
  //     expect(adminService.getAdminProjectByName).toHaveBeenCalledWith(
  //       getAdminProjectDto,
  //     );
  //   });
  // });

  describe('deleteAdmin', () => {
    it('should delete an admin', async () => {
      const adminEmailDto = {
        email: faker.internet.email(),
      };
      const mockDeleteResult = {
        success: true,
        admin: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          isVerified: true,
          mfaEnabled: true,
        },
      };

      jest
        .spyOn(adminService, 'deleteAdmin')
        .mockResolvedValue(mockDeleteResult);

      const result = await adminController.deleteAdmin(adminEmailDto);
      expect(result).toEqual(mockDeleteResult);
      expect(adminService.deleteAdmin).toHaveBeenCalledWith(adminEmailDto);
    });
  });
});
