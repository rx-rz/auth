import { Test, TestingModule } from '@nestjs/testing';
import { EmailAndPasswordAuthController } from './email-and-password-auth.controller';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { faker } from '@faker-js/faker';
import { LoginWithEmailAndPasswordDto, RegisterWithEmailAndPasswordDto } from './schema';
import { Response } from 'express';

describe('EmailAndPasswordAuthController', () => {
  let controller: EmailAndPasswordAuthController;
  let emailAndPasswordAuthService: EmailAndPasswordAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailAndPasswordAuthController],
      providers: [
        {
          provide: EmailAndPasswordAuthService,
          useValue: {
            registerWithEmailAndPassword: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, message: 'User registered successfully' });
            }),
            loginWithEmailAndPassword: jest.fn().mockImplementation(() => {
              return Promise.resolve({
                success: true,
                accessToken: faker.string.uuid(),
                refreshToken: faker.string.uuid(),
              });
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailAndPasswordAuthController>(EmailAndPasswordAuthController);
    emailAndPasswordAuthService = module.get<EmailAndPasswordAuthService>(
      EmailAndPasswordAuthService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Register with email and password', () => {
    const registerWithEmailAndPasswordDto: RegisterWithEmailAndPasswordDto = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
      projectId: faker.string.uuid(),
    };

    it('should successfully register a user', async () => {
      await expect(
        controller.registerWithEmailAndPassword(registerWithEmailAndPasswordDto),
      ).resolves.toEqual(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
        }),
      );
      expect(emailAndPasswordAuthService.registerWithEmailAndPassword).toHaveBeenCalledWith(
        registerWithEmailAndPasswordDto,
      );
    });
  });

  describe('Sign in with email and password', () => {
    const loginWithEmailAndPasswordDto: LoginWithEmailAndPasswordDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      projectId: faker.string.uuid(),
    };

    it('should successfully sign in a user', async () => {
      const response: Response = {
        cookie: jest.fn(),
      } as unknown as Response;
      await expect(
        controller.signInWithEmailAndPassword(loginWithEmailAndPasswordDto, response),
      ).resolves.toEqual(
        expect.objectContaining({
          success: true,
          accessToken: expect.any(String),
        }),
      );
      expect(emailAndPasswordAuthService.loginWithEmailAndPassword).toHaveBeenCalledWith(
        loginWithEmailAndPasswordDto,
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
    });
  });
});
