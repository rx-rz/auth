import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { PrismaService } from 'src/infra/db/prisma.service';
import { OTPRepository } from './otp.repository';
import { UserRepository } from 'src/user/user.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { faker } from '@faker-js/faker';
import { BadRequestException, GoneException, NotFoundException } from '@nestjs/common';
import { CreateOtpDto, VerifyAdminOtpDto, VerifyOtpDto } from './schema';

describe('OtpService', () => {
  let otpService: OtpService;
  let prismaService: PrismaService;

  const mockUserRepository = {
    getUserByEmail: jest.fn(),
    updateUserDetails: jest.fn(),
  };

  const mockAdminRepository = {
    getAdminByEmail: jest.fn(),
    updateAdmin: jest.fn(),
  };

  const mockOtpRepository = {
    updateOTP: jest.fn(),
    createOTP: jest.fn(),
    getOTPDetails: jest.fn(),
    deleteOTP: jest.fn(),
  };

  const userResolvedFromMock = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    isVerified: false,
    mfaEnabled: false,
  };

  const adminResolvedFromMock = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    id: faker.string.uuid(),
    isVerified: false,
    mfaEnabled: false,
  };

  const otpResolvedFromMock = {
    email: faker.internet.email(),
    code: faker.string.numeric(6),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        PrismaService,
        {
          provide: OTPRepository,
          useValue: mockOtpRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
    prismaService = module.get(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prismaService.$disconnect;
  });

  it('should be defined', () => {
    expect(otpService).toBeDefined();
  });

  describe('sendOTP', () => {
    const dto: CreateOtpDto = {
      email: faker.internet.email(),
      isAdmin: false,
    };

    it('should successfully send an OTP to a user', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValueOnce(null);
      mockOtpRepository.createOTP.mockResolvedValue(otpResolvedFromMock);
      const result = await otpService.sendOTP(dto);

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.createOTP).toHaveBeenCalledWith({
        email: dto.email,
        code: expect.any(String),
        expiresAt: expect.any(Date),
      });
      expect(result.success).toBe(true);
      expect(result.otpDetails).toEqual(otpResolvedFromMock);
    });

    it('should successfully send an OTP to an admin', async () => {
      const dto: CreateOtpDto = {
        email: faker.internet.email(),
        isAdmin: true,
      };
      mockAdminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValueOnce(null);
      mockOtpRepository.createOTP.mockResolvedValue(otpResolvedFromMock);

      const result = await otpService.sendOTP(dto);

      expect(mockAdminRepository.getAdminByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.createOTP).toHaveBeenCalledWith({
        email: dto.email,
        code: expect.any(String),
        expiresAt: expect.any(Date),
      });
      expect(result.success).toBe(true);
      expect(result.otpDetails).toEqual(otpResolvedFromMock);
    });

    it('should throw a not found exception when the user does not exist', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      await expect(otpService.sendOTP(dto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should update the OTP if it already exists', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValueOnce(otpResolvedFromMock);
      mockOtpRepository.updateOTP.mockResolvedValue(otpResolvedFromMock);

      const result = await otpService.sendOTP(dto);

      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.updateOTP).toHaveBeenCalledWith(dto.email, expect.any(Number));
      expect(result.success).toBe(true);
      expect(result.otpDetails).toEqual(otpResolvedFromMock);
    });
  });

  describe('verifyAdminOTP', () => {
    const dto: VerifyAdminOtpDto = {
      email: faker.internet.email(),
      code: otpResolvedFromMock.code,
    };

    it('should successfully verify an admin OTP', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockAdminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);

      const result = await otpService.verifyAdminOTP(dto);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockAdminRepository.getAdminByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockAdminRepository.updateAdmin).toHaveBeenCalledWith(dto.email, {
        isVerified: true,
      });
      expect(mockOtpRepository.deleteOTP).toHaveBeenCalledWith(dto.email);
      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
    });

    it('should throw a not found exception when the OTP does not exist', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(null);
      await expect(otpService.verifyAdminOTP(dto)).rejects.toThrow(NotFoundException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a not found exception when the admin does not exist', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockAdminRepository.getAdminByEmail.mockResolvedValue(null);
      await expect(otpService.verifyAdminOTP(dto)).rejects.toThrow(NotFoundException);
      expect(mockAdminRepository.getAdminByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a bad request exception when the OTP is invalid', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockAdminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValue({
        ...otpResolvedFromMock,
        code: faker.string.numeric(6),
      });
      await expect(otpService.verifyAdminOTP(dto)).rejects.toThrow(BadRequestException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a gone exception when the OTP has expired', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockAdminRepository.getAdminByEmail.mockResolvedValue(adminResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValue({
        ...otpResolvedFromMock,
        expiresAt: new Date(Date.now() - 10 * 60 * 1000),
      });
      await expect(otpService.verifyAdminOTP(dto)).rejects.toThrow(GoneException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.deleteOTP).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('verifyOTP', () => {
    const dto: VerifyOtpDto = {
      email: faker.internet.email(),
      code: otpResolvedFromMock.code,
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
    };

    it('should successfully verify a user OTP', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockUserRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);

      const result = await otpService.verifyOTP(dto);

      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserRepository.updateUserDetails).toHaveBeenCalledWith(dto.userId, dto.projectId, {
        isVerified: true,
      });
      expect(mockOtpRepository.deleteOTP).toHaveBeenCalledWith(dto.email);
      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP verified successfully');
    });

    it('should throw a not found exception when the OTP does not exist', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(null);
      await expect(otpService.verifyOTP(dto)).rejects.toThrow(NotFoundException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a not found exception when the user does not exist', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      await expect(otpService.verifyOTP(dto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a bad request exception when the OTP is invalid', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockUserRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValue({
        ...otpResolvedFromMock,
        code: faker.string.numeric(6),
      });
      await expect(otpService.verifyOTP(dto)).rejects.toThrow(BadRequestException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
    });

    it('should throw a gone exception when the OTP has expired', async () => {
      mockOtpRepository.getOTPDetails.mockResolvedValue(otpResolvedFromMock);
      mockUserRepository.getUserByEmail.mockResolvedValue(userResolvedFromMock);
      mockOtpRepository.getOTPDetails.mockResolvedValue({
        ...otpResolvedFromMock,
        expiresAt: new Date(Date.now() - 10 * 60 * 1000),
      });
      await expect(otpService.verifyOTP(dto)).rejects.toThrow(GoneException);
      expect(mockOtpRepository.getOTPDetails).toHaveBeenCalledWith(dto.email);
      expect(mockOtpRepository.deleteOTP).toHaveBeenCalledWith(dto.email);
    });
  });
});
