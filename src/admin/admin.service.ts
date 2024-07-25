import {
  BadRequestException,
  ConflictException,
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
import { UpdateAdminEmailDto } from './dtos/update-admin-email-dto';
import { compare } from 'bcryptjs';
import { UpdateAdminPasswordDto } from './dtos/update-admin-password-dto';
import { AdminIdDto } from './dtos/admin-id-dto';
import { GetAdminProjectDto } from './dtos/get-admin-project';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  private async getAdmin(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    return admin;
  }

  private async checkIfAdminExists(email: string) {
    const admin = await this.getAdmin(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async checkIfPasswordsMatch(email: string, password: string) {
    const existingPasswordInDB =
      await this.adminRepository.getAdminPassword(email);
    const passwordsMatch = await compare(password, existingPasswordInDB);
    return passwordsMatch;
  }

  async registerAdmin(data: RegisterAdminDTO) {
    const admin = await this.getAdmin(data.email);
    if (admin) throw new ConflictException('Admin already created.');
    await this.adminRepository.createAdmin({
      ...data,
      password: await hashValue(data.password),
      mfaEnabled: false,
      isVerified: false,
    });
    return { success: true, message: 'Admin registered successfully.' };
  }

  async loginAdmin({ email, password }: LoginAdminDto) {
    const adminPassword = await this.adminRepository.getAdminPassword(email);
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!adminPassword || !admin)
      throw new NotFoundException(
        'Admin with the provided details does not exist.',
      );

    const passwordIsCorrect = await checkIfHashedValuesMatch(
      password,
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
        id: admin.id,
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

  async updateAdmin({ email, ...details }: UpdateAdminDTO) {
    await this.checkIfAdminExists(email);
    const admin = await this.adminRepository.updateAdmin(email, details);
    return { success: true, admin };
  }

  async updateAdminEmail({
    currentEmail,
    newEmail,
    password,
  }: UpdateAdminEmailDto) {
    await this.checkIfAdminExists(currentEmail);
    const passwordsMatch = await this.checkIfPasswordsMatch(
      currentEmail,
      password,
    );
    if (!passwordsMatch)
      throw new BadRequestException('Invalid details provided');
    const admin = await this.adminRepository.updateAdminEmail(
      currentEmail,
      newEmail,
    );
    return { success: true, admin };
  }

  async updateAdminPassword({
    currentPassword,
    email,
    newPassword,
  }: UpdateAdminPasswordDto) {
    const passwordsMatch = await this.checkIfPasswordsMatch(
      email,
      currentPassword,
    );
    if (!passwordsMatch)
      throw new BadRequestException('Invalid details provided');
    const admin = await this.adminRepository.updateAdminPassword(
      email,
      newPassword,
    );
    return { success: true, admin };
  }

  async getAdminProjects({ adminId }: AdminIdDto) {
    const adminProjects = await this.adminRepository.getAdminProjects(adminId);
    return { success: true, adminProjects };
  }

  async getAdminProjectByName({ adminId, name }: GetAdminProjectDto) {
    const adminProject = await this.adminRepository.getAdminProjectByName(
      adminId,
      name,
    );
    return { success: true, adminProject };
  }
}
