import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { AdminRepository } from './admin.repository';
import { hashPassword } from 'src/utils/helper-functions/hash-password';
import { UpdateAdminDTO } from 'src/admin/dtos/update-admin-dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  private async checkIfAdminExists(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async registerAdmin(registerAdminDTO: RegisterAdminDTO) {
    const admin = await this.adminRepository.createAdmin({
      ...registerAdminDTO,
      password: hashPassword(registerAdminDTO.password),
      mfaEnabled: false,
      isVerified: false,
    });
    return admin;
  }

  async updateAdmin(updateAdminDTO: UpdateAdminDTO) {
    const { email, ...data } = updateAdminDTO;
    const admin = await this.checkIfAdminExists(email);
    const updatedAdmin = await this.adminRepository.updateAdmin(
      admin.email,
      data,
    );
    return updatedAdmin;
  }
}
