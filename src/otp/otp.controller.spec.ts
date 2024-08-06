import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { CreateOtpDto, VerifyAdminOtpDto, VerifyOtpDto } from './schema';
import { faker } from '@faker-js/faker';

describe('OtpController', () => {
  let controller: OtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        {
          provide: OtpService,
          useValue: {
            sendOTP: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, otpDetails: {} });
            }),
            verifyOTP: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, message: '' });
            }),
            verifyAdminOTP: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, message: '' });
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Send OTP', () => {
    const dto: CreateOtpDto = {
      email: faker.internet.email(),
    };

    it('should successfully send an OTP', async () => {
      await expect(controller.sendOTP(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  describe('Verify OTP', () => {
    const dto: VerifyOtpDto = {
      email: faker.internet.email(),
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
    };
    it('should successfully verify an OTP', async () => {
      await expect(controller.verifyOTP(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  describe('Verify Admin OTP', () => {
    const dto: VerifyAdminOtpDto = {
      email: faker.internet.email(),
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
    };
    it("should successfully verify an admin's OTP", async () => {
      await expect(controller.verifyAdminOtp(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });
});
