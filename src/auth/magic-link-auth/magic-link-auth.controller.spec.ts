import { Test, TestingModule } from '@nestjs/testing';
import { MagicLinkAuthController } from './magic-link-auth.controller';
import { MagicLinkAuthService } from './magic-link-auth.service';

describe('MagicLinkAuthController', () => {
  let controller: MagicLinkAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagicLinkAuthController],
      providers: [MagicLinkAuthService],
    }).compile();

    controller = module.get<MagicLinkAuthController>(MagicLinkAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
