import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { LoginRepository } from './login.repository';
import { CreateLoginInstanceDto } from './schema';
import { faker } from '@faker-js/faker';
import { AuthMethod } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('LoginService', () => {
  let loginService: LoginService;
  let loginRepository: jest.Mocked<LoginRepository>;
  let mockLoginRepository = {
    getLoginInstance: jest.fn(),
    createLoginInstance: jest.fn(),
    deleteLoginInstance: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: LoginRepository,
          useValue: mockLoginRepository,
        },
      ],
    }).compile();

    loginService = module.get<LoginService>(LoginService);
    loginRepository = module.get(LoginRepository);
  });

  it('should be defined', () => {
    expect(loginService).toBeDefined();
  });

  describe('create login instance', () => {
    const dto: CreateLoginInstanceDto = {
      userId: faker.string.uuid(),
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
      failureReason: faker.word.words({ count: 30 }),
      ipAddress: faker.internet.ip(),
      projectId: faker.string.uuid(),
      status: 'SUCCESS',
      userAgent: faker.internet.userAgent(),
    };
    it('should successfully create a login instance', async () => {
      loginRepository.createLoginInstance.mockResolvedValue({
        ...dto,
        id: faker.string.uuid(),
        createdAt: faker.date.soon(),
      });
      const result = await loginService.createLoginInstance(dto);
      expect(loginRepository.createLoginInstance).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
    });
  });

  describe('delete login instance', () => {
    const dto = {
      id: faker.string.uuid(),
    };
    it('successfully deletes a login instance', async () => {
      loginRepository.getLoginInstance.mockResolvedValue(
        expect.objectContaining({
          id: expect.any(String),
        }),
      );
      const result = await loginService.deleteLoginInstance(dto);
      expect(loginRepository.deleteLoginInstance).toHaveBeenCalledWith(dto.id);
      expect(result.success).toBe(true);
    });

    it('throws a not found error when an invalid login id is provided', async () => {
      loginRepository.getLoginInstance.mockResolvedValue(null);
      await expect(loginService.deleteLoginInstance(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
