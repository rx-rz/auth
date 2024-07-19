import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterAdminDTO } from './dtos/register-admin-dto';
import { AdminRepository } from './admin.repository';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { UpdateAdminDTO } from 'src/admin/dtos/update-admin-dto';
import { LoginAdminDto } from './dtos/login-admin-dto';
import { checkIfHashedValuesMatch } from 'src/utils/helper-functions/check-if-hashed-values-match';
import { generateAccessToken } from 'src/utils/helper-functions/generate-access-token';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthMethod } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private eventEmitter: EventEmitter2,
  ) {}

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
      password: await hashValue(registerAdminDTO.password),
      mfaEnabled: false,
      isVerified: false,
    });
    return { success: true, message: 'Admin registered successfully.' };
  }

  async updateAdmin(updateAdminDTO: UpdateAdminDTO) {
    const { email, ...data } = updateAdminDTO;
    const admin = await this.checkIfAdminExists(email);
    const updatedAdmin = await this.adminRepository.updateAdmin(
      admin.email,
      data,
    );
    return { updatedAdmin, success: true };
  }

  async loginAdmin(loginAdminDTO: LoginAdminDto) {
    const adminPassword = await this.adminRepository.getAdminPassword(
      loginAdminDTO.email,
    );
    const admin = await this.adminRepository.getAdminByEmail(
      loginAdminDTO.email,
    );
    if (!adminPassword || !admin)
      throw new NotFoundException(
        'Admin with the provided detials does not exist.',
      );

    const passwordIsCorrect = await checkIfHashedValuesMatch(
      loginAdminDTO.password,
      adminPassword,
    );
    if (!passwordIsCorrect)
      throw new BadRequestException('Invalid login credentials.');
    const [accessToken, refreshToken] = [
      generateAccessToken({
        email: admin.email,
        firstName: admin.firstName,
        isVerified: admin.isVerified,
        lastName: admin.lastName,
        role: 'admin',
        mfaEnabled: admin.mfaEnabled,
      }),
      await generateHashedRefreshToken(),
    ];
    this.eventEmitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return { success: true, accessToken, refreshToken };
  }
}
