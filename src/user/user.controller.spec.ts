import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  EmailDto,
  UpdateUserProjectDetailsDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UserIdDto,
  UserIDProjectIDDto,
} from './schema';
import { faker } from '@faker-js/faker';

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserDetails: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            getUserProjectDetails: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            updateUser: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            deleteUser: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            updateUserProjectPassword: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
            updateUserEmail: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, user: {} });
            }),
          },
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('Get user details', () => {
    const dto: UserIdDto = {
      userId: faker.string.uuid(),
    };
    it('should successfully get user details', async () => {
      await expect(userController.getUserDetails(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Get user project details', () => {
    const dto: UserIDProjectIDDto = {
      userId: faker.string.uuid(),
      projectId: faker.string.uuid(),
    };
    it('should successfully get user project details', async () => {
      await expect(userController.getUserProjectDetails(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Update user', () => {
    const dto: UpdateUserProjectDetailsDto = {
      userId: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      projectId: faker.string.uuid(),
    };
    it('should successfully update a user', async () => {
      await expect(userController.updateUser(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Delete user', () => {
    const dto: EmailDto = {
      email: faker.internet.email(),
    };
    it('should successfully delete a user', async () => {
      await expect(userController.deleteUser(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Update user password', () => {
    const dto: UpdateUserPasswordDto = {
      userId: faker.string.uuid(),
      currentPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
      email: faker.internet.email(),
      projectId: faker.string.uuid(),
    };
    it('should successfully update a user password', async () => {
      await expect(userController.updateUserProjectPassword(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });

  describe('Update user email', () => {
    const dto: UpdateUserEmailDto = {
      newEmail: faker.internet.email(),
      password: faker.internet.password(),
      projectId: faker.string.uuid(),
      currentEmail: faker.internet.email(),
    };
    it('should successfully update a user email', async () => {
      await expect(userController.updateUserEmail(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        }),
      );
    });
  });
});
