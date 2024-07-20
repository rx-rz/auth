import { Test, TestingModule } from '@nestjs/testing';
import { WebauthnMfaService } from './webauthn-mfa.service';

describe('WebauthnMfaService', () => {
  let service: WebauthnMfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebauthnMfaService],
    }).compile();

    service = module.get<WebauthnMfaService>(WebauthnMfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
