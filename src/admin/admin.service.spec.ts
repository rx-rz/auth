import {
  AdminEmailDto,
  GetAdminProjectDto,
  RegisterAdminDto,
  UpdateAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
} from './schema';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infra/db/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { faker } from '@faker-js/faker';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('Admin Controller', () => {
  let service: AdminService;
  let adminRepository: jest.Mocked<AdminRepository>;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: PrismaService;
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAppEventEmitter = {
    emit: jest.fn(),
  };

  const mockAdminRepository = {
    getAdminByEmail: jest.fn(),
    getAdminByID: jest.fn(),
    createAdmin: jest.fn(),
    getAdminPassword: jest.fn(),
    updateAdmin: jest.fn(),
    updateAdminEmail: jest.fn(),
    updateAdminPassword: jest.fn(),
    getAdminProjects: jest.fn(),
    getAdminProjectByName: jest.fn(),
    deleteAdmin: jest.fn(),
  };

  const adminResolvedFromMock = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    isVerified: false,
    mfaEnabled: false,
  };

  jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
  }));

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
        {
          provide: AppEventEmitter,
          useValue: mockAppEventEmitter,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        PrismaService,
        EventEmitter2,
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get(AdminRepository);
    appEventEmitter = module.get(AppEventEmitter);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prismaService.$disconnect;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register admin', () => {
    const registerAdminDto: RegisterAdminDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    it('should successfully register a new admin', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);
      adminRepository.createAdmin.mockResolvedValue(adminResolvedFromMock);

      const result = await service.registerAdmin(registerAdminDto);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(registerAdminDto.email);
      expect(adminRepository.createAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          ...registerAdminDto,
          password: expect.any(String),
          mfaEnabled: false,
          isVerified: false,
        }),
      );
      expect(result).toEqual({
        success: true,
        message: 'Admin registered successfully.',
      });
    });
    it('should throw a conflict exception whenever an admin with the same email is already registered', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      await expect(service.registerAdmin(registerAdminDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login admin', () => {
    const loginAdminDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should login an admin successfully', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      adminRepository.getAdminPassword.mockResolvedValue(faker.string.alphanumeric());
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      adminRepository.getAdminPassword.mockResolvedValue(faker.string.alphanumeric());
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      jwtService.signAsync.mockResolvedValue('mockAccessToken');
      configService.get.mockReturnValue('JWT_ACCESS_SECRET');
      const result = await service.loginAdmin(loginAdminDto);

      expect(adminRepository.getAdminPassword).toHaveBeenCalledWith(loginAdminDto.email);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(loginAdminDto.email);
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(appEventEmitter.emit).toHaveBeenCalledWith(
        'refresh-token.created',
        expect.objectContaining({
          token: expect.any(String),
          expiresAt: expect.any(Date),
          adminId: expect.any(String),
        }),
      );
      expect(result).toEqual({
        success: true,
        accessToken: 'mockAccessToken',
        refreshToken: expect.any(String),
      });
    });

    it('should throw a bad request exception when the password is incorrect', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      adminRepository.getAdminPassword.mockResolvedValue(faker.string.alphanumeric());
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      await expect(service.loginAdmin(loginAdminDto)).rejects.toThrow(BadRequestException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(loginAdminDto.email);
      expect(adminRepository.getAdminPassword).toHaveBeenCalledWith(loginAdminDto.email);
    });

    it('should throw a not found exception when the email provided for admin does not exist in the db', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);
      await expect(service.loginAdmin(loginAdminDto)).rejects.toThrow(NotFoundException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(loginAdminDto.email);
    });
  });

  describe('update admin', () => {
    const updateAdminDto = {
      email: faker.internet.email(),
      isVerified: true,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    it('should successfully update admin details', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      const result = await service.updateAdmin(updateAdminDto);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.email);
      expect(result.success).toBe(true);
    });

    it('should throw a not found exception whenever an invalid email is provided', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);
      await expect(service.updateAdmin(updateAdminDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update admin email', () => {
    const updateAdminDto: UpdateAdminEmailDto = {
      currentEmail: faker.internet.email(),
      newEmail: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should successfully update admin email', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      adminRepository.getAdminByEmail.mockResolvedValueOnce(null);
      adminRepository.getAdminByEmail.mockResolvedValueOnce(adminResolvedFromMock);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      adminRepository.updateAdminEmail.mockResolvedValue(adminResolvedFromMock);
      const result = await service.updateAdminEmail(updateAdminDto);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.currentEmail);
      expect(adminRepository.updateAdminEmail).toHaveBeenCalledWith(
        updateAdminDto.currentEmail,
        updateAdminDto.newEmail,
      );
      expect(result.success).toBe(true);
      // expect(result.admin).toEqual(updatedAdmin);
    });

    it('should throw a not found exception when updating with an inexistent email', async () => {
      // mocks that new email isn't in the db
      adminRepository.getAdminByEmail.mockResolvedValueOnce(null);
      //mocks that current email isn't in the db
      adminRepository.getAdminByEmail.mockResolvedValueOnce(null);
      await expect(service.updateAdminEmail(updateAdminDto)).rejects.toThrow(NotFoundException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.newEmail);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.currentEmail);
    });

    it('should throw a conflict exception when the new email provided already exists in the database', async () => {
      adminRepository.getAdminByEmail.mockResolvedValueOnce(adminResolvedFromMock);
      await expect(service.updateAdminEmail(updateAdminDto)).rejects.toThrow(ConflictException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.newEmail);
    });

    it('should throw a bad request exception for invalid passwords', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      // Mock that the new email does not exist in the database
      adminRepository.getAdminByEmail.mockResolvedValueOnce(null);
      // Mock that the current email exists in the database
      adminRepository.getAdminByEmail.mockResolvedValueOnce(adminResolvedFromMock);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      await expect(service.updateAdminEmail(updateAdminDto)).rejects.toThrow(BadRequestException);

      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.newEmail);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminDto.currentEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(updateAdminDto.password, expect.any(String));
    });
  });

  describe('update admin password', () => {
    const updateAdminPasswordDto: UpdateAdminPasswordDto = {
      currentPassword: faker.internet.password(),
      email: faker.internet.email(),
      newPassword: faker.internet.password(),
    };

    it('should successfully update admin password', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      adminRepository.updateAdminPassword.mockResolvedValue(adminResolvedFromMock);
      const result = await service.updateAdminPassword(updateAdminPasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateAdminPasswordDto.currentPassword,
        expect.any(String),
      );
      expect(adminRepository.updateAdminPassword).toHaveBeenCalledWith(
        updateAdminPasswordDto.email,
        updateAdminPasswordDto.newPassword,
      );
      expect(result.success).toBe(true);
      // expect(result.admin).toEqual(updatedAdmin);
    });

    it('should throw a not found exception when email does not exist', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);
      await expect(service.updateAdminPassword(updateAdminPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminPasswordDto.email);
    });

    it('should throw a bad request exception for invalid current password', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      // Mock that the email exists in the database
      adminRepository.getAdminByEmail.mockResolvedValueOnce(adminResolvedFromMock);

      await expect(service.updateAdminPassword(updateAdminPasswordDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateAdminPasswordDto.currentPassword,
        expect.any(String),
      );
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(updateAdminPasswordDto.email);
    });
  });

  describe('get admin projects', () => {
    const adminEmailDto: AdminEmailDto = {
      email: faker.string.uuid(),
    };
    it('should successfully get admin projects', async () => {
      const adminProjectsResolvedFromMock = [
        {
          id: faker.string.uuid(),
          name: faker.company.name(),
          createdAt: faker.date.recent(),
        },
        {
          id: faker.string.uuid(),
          name: faker.company.name(),
          createdAt: faker.date.recent(),
        },
      ];

      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      adminRepository.getAdminProjects.mockResolvedValue(adminProjectsResolvedFromMock);

      const result = await service.getAdminProjects(adminEmailDto);

      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(adminEmailDto.email);
      expect(adminRepository.getAdminProjects).toHaveBeenCalledWith(adminEmailDto.email);
      expect(result.success).toBe(true);
      expect(result.adminProjects).toEqual(adminProjectsResolvedFromMock);
    });

    it('should throw a not found exception when admin does not exist', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);

      await expect(service.getAdminProjects(adminEmailDto)).rejects.toThrow(NotFoundException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(adminEmailDto.email);
    });
  });

  describe('delete admin', () => {
    const adminEmailDto: AdminEmailDto = {
      email: faker.string.uuid(),
    };
    it('should successfully delete an admin', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      adminRepository.deleteAdmin.mockResolvedValue(adminResolvedFromMock);

      const result = await service.deleteAdmin(adminEmailDto);

      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(adminEmailDto.email);
      expect(adminRepository.deleteAdmin).toHaveBeenCalledWith(adminEmailDto.email);
      expect(result.success).toBe(true);
      expect(result.admin).toEqual(adminResolvedFromMock);
    });

    it('should throw a not found exception when admin does not exist', async () => {
      adminRepository.getAdminByEmail.mockResolvedValue(null);

      await expect(service.deleteAdmin(adminEmailDto)).rejects.toThrow(NotFoundException);
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(adminEmailDto.email);
    });
  });
});
