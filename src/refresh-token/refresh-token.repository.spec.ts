import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('RefreshTokenRepository', () => {
  let refreshTokenRepository: RefreshTokenRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              delete: jest.fn(),
            },
            admin: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    refreshTokenRepository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('storeRefreshToken', () => {
    it('should store a refresh token', async () => {
      const mockRefreshTokenData: Prisma.RefreshTokenCreateInput = {
        token: faker.string.uuid(),
        expiresAt: faker.date.future(),
      };
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshTokenData);
      await refreshTokenRepository.storeRefreshToken(mockRefreshTokenData);
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: mockRefreshTokenData,
      });
    });
  });

  describe('getRefreshToken', () => {
    it('should get a refresh token by ID', async () => {
      const mockRefreshTokenId = faker.string.uuid();
      const mockRefreshToken = {
        id: mockRefreshTokenId,
        token: faker.string.uuid(),
        expiresAt: faker.date.future(),
        adminId: faker.string.uuid(),
      };
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      const result = await refreshTokenRepository.getRefreshToken(mockRefreshTokenId);
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { id: mockRefreshTokenId },
      });
      expect(result).toEqual(mockRefreshToken);
    });
  });

  describe('getRefreshTokens', () => {
    it('should get refresh tokens with provided args', async () => {
      const mockRefreshTokens = [
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          adminId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          adminId: faker.string.uuid(),
        },
      ];
      const mockArgs: Prisma.RefreshTokenFindManyArgs = {
        where: {
          token: {
            contains: faker.string.uuid(),
          },
        },
      };
      (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue(mockRefreshTokens);
      const result = await refreshTokenRepository.getRefreshTokens(mockArgs);
      expect(prismaService.refreshToken.findMany).toHaveBeenCalledWith(mockArgs);
      expect(result).toEqual(mockRefreshTokens);
    });
  });

  describe('getAdminRefreshTokens', () => {
    it('should get refresh tokens associated with an admin', async () => {
      const mockAdminEmail = faker.internet.email();
      const mockRefreshTokens = [
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          adminId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          adminId: faker.string.uuid(),
        },
      ];
      const mockAdmin = {
        id: faker.string.uuid(),
        email: mockAdminEmail,
      };
      (prismaService.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue(mockRefreshTokens);
      const result = await refreshTokenRepository.getAdminRefreshTokens(mockAdminEmail);
      expect(prismaService.refreshToken.findMany).toHaveBeenCalledWith({
        include: { admin: { where: { email: mockAdminEmail } } },
      });
      expect(result).toEqual(mockRefreshTokens);
    });
  });

  describe('getUserRefreshTokens', () => {
    it('should get refresh tokens associated with a user', async () => {
      const mockUserEmail = faker.internet.email();
      const mockRefreshTokens = [
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          userId: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          userId: faker.string.uuid(),
        },
      ];
      const mockUser = {
        id: faker.string.uuid(),
        email: mockUserEmail,
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue(mockRefreshTokens);
      const result = await refreshTokenRepository.getUserRefreshTokens(mockUserEmail);
      expect(prismaService.refreshToken.findMany).toHaveBeenCalledWith({
        include: { user: { where: { email: mockUserEmail } } },
      });
      expect(result).toEqual(mockRefreshTokens);
    });
  });

  describe('deleteAllRefreshTokensAssociatedToAdmin', () => {
    it('should delete all refresh tokens associated with an admin', async () => {
      const mockAdminEmail = faker.internet.email();
      (prismaService.refreshToken.deleteMany as jest.Mock).mockResolvedValue(
        faker.datatype.number(),
      );
      const result =
        await refreshTokenRepository.deleteAllRefreshTokensAssociatedToAdmin(mockAdminEmail);
      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { admin: { email: mockAdminEmail } },
      });
      expect(result).toBeDefined();
    });
  });

  describe('deleteAllRefreshTokensAssociatedToUser', () => {
    it('should delete all refresh tokens associated with a user', async () => {
      const mockUserEmail = faker.internet.email();
      (prismaService.refreshToken.deleteMany as jest.Mock).mockResolvedValue(
        faker.datatype.number(),
      );
      const result =
        await refreshTokenRepository.deleteAllRefreshTokensAssociatedToUser(mockUserEmail);
      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { user: { email: mockUserEmail } },
      });
      expect(result).toBeDefined();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete a refresh token by ID', async () => {
      const mockRefreshTokenId = faker.string.uuid();
      (prismaService.refreshToken.delete as jest.Mock).mockResolvedValue({
        id: mockRefreshTokenId,
      });
      const result = await refreshTokenRepository.deleteRefreshToken(mockRefreshTokenId);
      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: mockRefreshTokenId },
      });
      expect(result).toEqual({ id: mockRefreshTokenId });
    });
  });
});
