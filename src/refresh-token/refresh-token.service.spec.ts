import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { StoreRefreshTokenDto } from './schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { faker } from '@faker-js/faker';
import { AuthMethod } from '@prisma/client';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let eventEmitter: EventEmitter2;

  const mockRefreshTokenRepository = {
    storeRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        EventEmitter2,
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepository = module.get(RefreshTokenRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeOrUpdateRefreshToken', () => {
    const dto: StoreRefreshTokenDto = {
      token: faker.string.uuid(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: faker.string.uuid(),
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    };

    it('should successfully store a refresh token', async () => {
      mockRefreshTokenRepository.storeRefreshToken.mockResolvedValue(undefined);
      await service.storeOrUpdateRefreshToken(dto);
      expect(mockRefreshTokenRepository.storeRefreshToken).toHaveBeenCalledWith(dto);
    });
  });
});
