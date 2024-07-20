import { Test, TestingModule } from '@nestjs/testing';
import { WebauthnMfaController } from './webauthn-mfa.controller';
import { WebauthnMfaService } from './webauthn-mfa.service';

describe('WebauthnMfaController', () => {
  let controller: WebauthnMfaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebauthnMfaController],
      providers: [WebauthnMfaService],
    }).compile();

    controller = module.get<WebauthnMfaController>(WebauthnMfaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
