import { Test, TestingModule } from '@nestjs/testing';
import { OTPRepository } from './otp.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('OTPRepository', () => {
  let otpRepository: OTPRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OTPRepository,
        {
          provide: PrismaService,
          useValue: {
            otp: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    otpRepository = module.get<OTPRepository>(OTPRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createOTP', () => {
    it('should create an OTP', async () => {
      const mockOtpData: Prisma.OtpCreateInput = {
        code: faker.string.numeric(6),
        email: faker.internet.email(),
        expiresAt: faker.date.anytime(),
      };
      const mockCreatedOtp = { ...mockOtpData, createdAt: new Date() };
      (prismaService.otp.create as jest.Mock).mockResolvedValue(mockCreatedOtp);
      const result = await otpRepository.createOTP(mockOtpData);
      expect(prismaService.otp.create).toHaveBeenCalledWith({
        data: mockOtpData,
        select: otpRepository.otpReturnObject,
      });
      expect(result).toEqual(mockCreatedOtp);
    });
  });

  describe('getOTPDetails', () => {
    it('should get OTP details by email', async () => {
      const mockEmail = faker.internet.email();
      const mockOtp = {
        code: faker.string.numeric(6),
        email: mockEmail,
        expiresAt: faker.date.anytime(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.otp.findUnique as jest.Mock).mockResolvedValue(mockOtp);

      const result = await otpRepository.getOTPDetails(mockEmail);

      expect(prismaService.otp.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(result).toEqual(mockOtp);
    });
  });

  describe('updateOTP', () => {
    it('should update an OTP', async () => {
      const mockEmail = faker.internet.email();
      const mockCode = faker.string.numeric(6);
      const mockUpdatedOtp = {
        code: mockCode,
        email: mockEmail,
        expiresAt: faker.date.anytime(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.otp.update as jest.Mock).mockResolvedValue(mockUpdatedOtp);

      const result = await otpRepository.updateOTP(mockEmail, parseInt(mockCode));

      expect(prismaService.otp.update).toHaveBeenCalledWith({
        where: { email: mockEmail },
        data: { code: mockCode },
        select: otpRepository.otpReturnObject,
      });
      expect(result).toEqual(mockUpdatedOtp);
    });
  });

  describe('deleteOTP', () => {
    it('should delete an OTP', async () => {
      const mockEmail = faker.internet.email();
      const mockDeletedOtp = {
        code: faker.string.numeric(6),
        email: mockEmail,
        expiresAt: faker.date.anytime(),
        createdAt: faker.date.anytime(),
      };

      (prismaService.otp.delete as jest.Mock).mockResolvedValue(mockDeletedOtp);

      const result = await otpRepository.deleteOTP(mockEmail);

      expect(prismaService.otp.delete).toHaveBeenCalledWith({
        where: { email: mockEmail },
        select: otpRepository.otpReturnObject,
      });
      expect(result).toEqual(mockDeletedOtp);
    });
  });
});
