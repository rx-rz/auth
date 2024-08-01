import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
describe('Admin Controller', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, AdminRepository],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });
  describe('', () => {
    it('akhi', async () => {
      return true;
    });
  });
});
