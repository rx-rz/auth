import { Injectable } from '@nestjs/common';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { AdminRepository } from './admin.repository';
import { hashPassword } from 'src/utils/helper-functions/hash-password';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async registerAdmin(registerAdminDTO: RegisterAdminDTO) {
    const admin = await this.adminRepository.createAdmin({
      ...registerAdminDTO,
      password: hashPassword(registerAdminDTO.password),
      mfaEnabled: false,
      isVerified: false,
    });
    return admin;
  }
}
