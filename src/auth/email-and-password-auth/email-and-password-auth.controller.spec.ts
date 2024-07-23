import { Test, TestingModule } from '@nestjs/testing';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';

describe('EmailAndPasswordAuthController', () => {
  let controller: EmailAndPasswordAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailAndPasswordAuthController],
      providers: [EmailAndPasswordAuthService],
    }).compile();

    controller = module.get<EmailAndPasswordAuthController>(EmailAndPasswordAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
