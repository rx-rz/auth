import { Test, TestingModule } from '@nestjs/testing';
import { LoginRepository } from './login.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { AuthMethod, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CreateLoginInstanceDto } from './schema';
import { mock } from 'node:test';

describe('LoginRepository', () => {
  let loginRepository: LoginRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginRepository,
        {
          provide: PrismaService,
          useValue: {
            login: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    loginRepository = module.get<LoginRepository>(LoginRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createLoginInstance', () => {
    it('should create a login instance', async () => {
      const mockLoginData: CreateLoginInstanceDto = {
        userId: faker.string.uuid(),
        authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
        failureReason: faker.word.words({ count: 30 }),
        ipAddress: faker.internet.ip(),
        projectId: faker.string.uuid(),
        status: 'SUCCESS',
        userAgent: faker.internet.userAgent(),
      };
      const mockCreatedLogin = {
        ...mockLoginData,
        id: faker.string.uuid(),
        createdAt: faker.date.soon(),
        status: 'SUCCESS',
      };
      (prismaService.login.create as jest.Mock).mockResolvedValue(mockCreatedLogin);
      const result = await loginRepository.createLoginInstance(mockLoginData);
      expect(prismaService.login.create).toHaveBeenCalledWith({
        data: mockLoginData,
      });
      expect(result).toEqual(mockCreatedLogin);
    });
  });

  describe('getLoginInstance', () => {
    it('should get login instance by id', async () => {
      const mockId = faker.string.uuid();
      const mockLogin = {
        userId: faker.string.uuid(),
        authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
        failureReason: faker.word.words({ count: 30 }),
        ipAddress: faker.internet.ip(),
        projectId: faker.string.uuid(),
        status: 'SUCCESS',
        userAgent: faker.internet.userAgent(),
      };

      (prismaService.login.findUnique as jest.Mock).mockResolvedValue(mockLogin);

      const result = await loginRepository.getLoginInstance(mockId);

      expect(prismaService.login.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(result).toEqual(mockLogin);
    });
  });

  describe('deleteLoginInstance', () => {
    it('should delete a login instance', async () => {
      const mockId = faker.string.uuid();
      const mockDeletedLogin = {
        userId: faker.string.uuid(),
        authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
        failureReason: faker.word.words({ count: 30 }),
        ipAddress: faker.internet.ip(),
        projectId: faker.string.uuid(),
        status: 'SUCCESS',
        userAgent: faker.internet.userAgent(),
      };

      (prismaService.login.delete as jest.Mock).mockResolvedValue(mockDeletedLogin);

      const result = await loginRepository.deleteLoginInstance(mockId);

      expect(prismaService.login.delete).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(result).toEqual(mockDeletedLogin);
    });
  });
});
