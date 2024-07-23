import { Test, TestingModule } from '@nestjs/testing';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';

describe('EmailAndPasswordAuthService', () => {
  let service: EmailAndPasswordAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailAndPasswordAuthService],
    }).compile();

    service = module.get<EmailAndPasswordAuthService>(EmailAndPasswordAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
