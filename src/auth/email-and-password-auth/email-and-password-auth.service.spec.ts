import { Test, TestingModule } from '@nestjs/testing';
import { EmailAndPasswordAuthService } from './email-and-password-auth.service';
import { UserRepository } from 'src/user/user.repository';
import { PrismaService } from 'src/infra/db/prisma.service';
import { faker } from '@faker-js/faker';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginWithEmailAndPasswordDto, RegisterWithEmailAndPasswordDto } from './schema';
import * as generateAccessToken from 'src/utils/helper-functions/generate-access-token';
import * as generateHashedRefreshToken from 'src/utils/helper-functions/generate-hashed-refresh-token';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EmailAndPasswordAuthService', () => {
  let emailAndPasswordAuthService: EmailAndPasswordAuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let emitter: AppEventEmitter;
  const mockAppEventEmitter = {
    emit: jest.fn(),
  };

  jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
  }));

  const mockUserRepository = {
    getUserProjectDetailsByEmail: jest.fn().mockResolvedValue({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt: new Date(),
      isVerified: faker.datatype.boolean(),
      user: {
        email: faker.internet.email(),
      },
      role: {
        name: faker.person.jobTitle(),
        id: faker.string.uuid(),
      },
    }),
    getUserByEmail: jest.fn().mockResolvedValue({
      email: faker.internet.email(),
      id: faker.string.uuid(),
      userProjects: [
        {
          projectId: faker.string.uuid(),
          isVerified: faker.datatype.boolean(),
        },
      ],
    }),
    getUserPassword: jest.fn().mockResolvedValue({
      password: faker.internet.password(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAndPasswordAuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AppEventEmitter, useValue: mockAppEventEmitter },
        EventEmitter2,
        PrismaService,
      ],
    }).compile();

    emailAndPasswordAuthService = module.get<EmailAndPasswordAuthService>(
      EmailAndPasswordAuthService,
    );
    userRepository = module.get(UserRepository);
    emitter = module.get(AppEventEmitter);
  });

  it('should be defined', () => {
    expect(emailAndPasswordAuthService).toBeDefined();
  });

  describe('register with email and password', () => {
    it('should call the emitter with the correct arguments', async () => {
      const dto: RegisterWithEmailAndPasswordDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        projectId: faker.string.uuid(),
      };
      await emailAndPasswordAuthService.registerWithEmailAndPassword(dto);
      expect(emitter.emit).toHaveBeenCalledWith('user-create.email-password', dto);
    });
  });

  describe('login with email and password', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const dto: LoginWithEmailAndPasswordDto = {
        email: 'test@example.com',
        password: 'password',
        projectId: '123',
      };
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      const accessToken = faker.string.hexadecimal({ length: 50 });
      const refreshToken = faker.string.hexadecimal({ length: 20 });
      jest.spyOn(generateAccessToken, 'generateAccessToken').mockReturnValue(accessToken);
      jest
        .spyOn(generateHashedRefreshToken, 'generateHashedRefreshToken')
        .mockResolvedValue(refreshToken);
      const result = await emailAndPasswordAuthService.loginWithEmailAndPassword(dto);
      expect(userRepository.getUserPassword).toHaveBeenCalledWith(dto.email, dto.projectId);
      expect(result).toEqual({ success: true, accessToken, refreshToken });
    });

    it('should throw a bad request exception', async () => {
      const dto: LoginWithEmailAndPasswordDto = {
        email: 'test@example.com',
        password: 'password',
        projectId: '123',
      };

      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      await expect(emailAndPasswordAuthService.loginWithEmailAndPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a not found exception when the user does not exist', async () => {
      const dto: LoginWithEmailAndPasswordDto = {
        email: 'test@example.com',
        password: 'password',
        projectId: '123',
      };
      userRepository.getUserByEmail.mockResolvedValue(null);
      await expect(emailAndPasswordAuthService.loginWithEmailAndPassword(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a not found exception when the user project details could not be found', async () => {
      const dto: LoginWithEmailAndPasswordDto = {
        email: 'test@example.com',
        password: 'password',
        projectId: '123',
      };
      userRepository.getUserProjectDetailsByEmail.mockResolvedValue(null);
      await expect(emailAndPasswordAuthService.loginWithEmailAndPassword(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
