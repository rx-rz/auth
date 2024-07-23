import { Test, TestingModule } from '@nestjs/testing';
import { MagicLinkAuthService } from './magic-link-auth.service';

describe('MagicLinkAuthService', () => {
  let service: MagicLinkAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MagicLinkAuthService],
    }).compile();

    service = module.get<MagicLinkAuthService>(MagicLinkAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
