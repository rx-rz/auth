import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infra/db/prisma.service';
describe('Admin Controller', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  let appEventEmitter: jest.Mocked<AppEventEmitter>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, AdminRepository, AppEventEmitter, JwtService, ConfigService, PrismaService],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<AdminRepository>(AdminRepository) as jest.Mocked<AdminRepository>;
    appEventEmitter = module.get(
      AppEventEmitter,
    ) as jest.Mocked<AppEventEmitter>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });
  describe('', () => {
    it('akhi', async () => {
      return true;
    });
  });
});
