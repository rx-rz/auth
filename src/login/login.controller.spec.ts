import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { IdDto } from './schema';
import { faker } from '@faker-js/faker';

describe('LoginController', () => {
  let loginController: LoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginService,
          useValue: {
            deleteLoginInstance: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, login: {} });
            }),
          },
        },
      ],
    }).compile();

    loginController = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(loginController).toBeDefined();
  });

  describe('Delete login instance', () => {
    const dto: IdDto = {
      id: faker.string.uuid(),
    };
    it('should successfully delete a login instance', async () => {
      await expect(loginController.deleteLoginInstance(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          login: expect.any(Object),
        }),
      );
    });
  });
});
