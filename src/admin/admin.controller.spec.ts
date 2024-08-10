import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AdminEmailDto,
  GetAdminProjectDto,
  LoginAdminDto,
  RegisterAdminDto,
  UpdateAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
} from './schema';
import { faker } from '@faker-js/faker';
describe('Admin Controller', () => {
  let adminController: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            registerAdmin: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, message: 'Admin registered successfullly' });
            }),
            loginAdmin: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, message: 'Login successful' });
            }),
            updateAdmin: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, admin: {} });
            }),
            updateAdminEmail: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, admin: {} });
            }),
            updateAdminPassword: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, admin: {} });
            }),
            getAdminProjects: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, adminProjects: {} });
            }),
            getAdminProjectByName: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, adminProject: {} });
            }),
            deleteAdmin: jest.fn().mockImplementation(() => {
              return Promise.resolve({ success: true, admin: {} });
            }),
          },
        },
        ConfigService,
        JwtService,
        //  ProjectService,
      ],
    }).compile();
    adminController = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(adminController).toBeDefined();
  });

  describe('Register admin', () => {
    const dto: RegisterAdminDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    it('should successfully register an admin', async () => {
      await expect(adminController.registerAdmin(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          message: expect.any(String),
        }),
      );
    });
  });
  // describe('Login admin', () => {
  //   const loginAdminDto: LoginAdminDto = {
  //     email: faker.internet.email(),
  //     password: faker.internet.password(),
  //   };
  //   const response = {
  //     cookie: jest.fn(),
  //   } as unknown as jest.Mocked<Response>;
  //   it('should log in an admin successfully', async () => {
  //     await expect(adminController.loginAdmin(loginAdminDto, response)).resolves.toEqual(
  //       expect.objectContaining({
  //         success: true,
  //         admin: expect.any(Object),
  //       }),
  //     );
  //   });
  // });

  describe('Update admin', () => {
    const dto: UpdateAdminDto = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
    };
    it('should successfully update an admin', async () => {
      await expect(adminController.updateAdmin(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          admin: expect.any(Object),
        }),
      );
    });
  });

  describe('Update admin email', () => {
    const dto: UpdateAdminEmailDto = {
      currentEmail: faker.internet.email(),
      newEmail: faker.internet.email(),
      password: faker.internet.password(),
    };
    it('should successfully update an admin', async () => {
      await expect(adminController.updateAdminEmail(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          admin: expect.any(Object),
        }),
      );
    });
  });

  describe('Update admin password', () => {
    const dto: UpdateAdminPasswordDto = {
      email: faker.internet.email(),
      newPassword: faker.internet.password(),
      currentPassword: faker.internet.password(),
    };
    it('should successfully update an admin', async () => {
      await expect(adminController.updateAdminPassword(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          admin: expect.any(Object),
        }),
      );
    });
  });

  describe('Get admin projects', () => {
    const dto: AdminEmailDto = {
      email: faker.internet.email(),
    };
    it('should successfully update an admin', async () => {
      await expect(adminController.getAdminProjects(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          adminProjects: expect.any(Object),
        }),
      );
    });
  });

  describe('Get admin project by name', () => {
    const dto: GetAdminProjectDto = {
      adminId: faker.string.uuid(),
      name: faker.company.name(),
    };
    it("should successfully get an admin project by it's name", async () => {
      await expect(adminController.getAdminProjectByName(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          adminProject: expect.any(Object),
        }),
      );
    });
  });

  describe('Delete admin account', () => {
    const dto: AdminEmailDto = {
      email: faker.internet.email(),
    };
    it('should successfully delete an admin account', async () => {
      await expect(adminController.deleteAdmin(dto)).resolves.toEqual(
        expect.objectContaining({
          success: true,
          admin: expect.any(Object),
        }),
      );
    });
  });
});
