import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './refresh-token.repository';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [RefreshTokenService, RefreshTokenRepository],
    }).compile();

    controller = module.get<RefreshTokenController>(RefreshTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
