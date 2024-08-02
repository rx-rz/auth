import { RegisterAdminDto } from './schema';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infra/db/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { faker } from '@faker-js/faker';
import { BadRequestException, ConflictException } from '@nestjs/common';

import * as helperFunctions from 'src/utils/helper-functions';
describe('Admin Controller', () => {
  let service: AdminService;
  let adminRepository: jest.Mocked<AdminRepository>;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

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
    createAdmin: jest.fn(),
    getAdminPassword: jest.fn(),
  };

  const adminResolvedFromMock = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    isVerified: false,
    mfaEnabled: false,
  };

  beforeEach(async () => {
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
    eventEmitter = module.get(EventEmitter2);
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
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(
        registerAdminDto.email,
      );
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
      await expect(service.registerAdmin(registerAdminDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login admin', () => {

    const loginAdminDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it.skip('should login an admin successfully', async () => {
      adminRepository.getAdminPassword.mockResolvedValue(
        faker.string.alphanumeric(),
      );
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      jwtService.signAsync.mockResolvedValue('mockAccessToken');
      configService.get.mockReturnValue('JWT_ACCESS_SECRET');
      jest.spyOn(helperFunctions, 'checkIfHashedValuesMatch').mockResolvedValue(true)
      const result = await service.loginAdmin(loginAdminDto);

      expect(adminRepository.getAdminPassword).toHaveBeenCalledWith(
        loginAdminDto.email,
      );
      expect(adminRepository.getAdminByEmail).toHaveBeenCalledWith(
        loginAdminDto.email,
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(appEventEmitter.emit).toHaveBeenCalledWith(
        'refresh-token.created',
        expect.any(Object),
      );
      expect(result).toEqual({
        success: true,
        accessToken: 'mockAccessToken',
        refreshToken: expect.any(String),
      });
    });

    it.skip('should throw a bad request exception when the password is incorrect', async () => {
      adminRepository.getAdminPassword.mockResolvedValue(
        faker.string.alphanumeric(),
      );
      adminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      jest
        .spyOn(helperFunctions, 'checkIfHashedValuesMatch')
        .mockResolvedValue(false);
      await expect(service.loginAdmin(loginAdminDto)).rejects.toThrow(
        BadRequestException,
      );

    });
  });
});
