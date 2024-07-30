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
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthMethod } from '@prisma/client';
import { UpdateAdminEmailDto } from './dtos/update-admin-email-dto';
import { compare } from 'bcryptjs';
import { UpdateAdminPasswordDto } from './dtos/update-admin-password-dto';
import { AdminIdDto } from './dtos/admin-id-dto';
import { GetAdminProjectDto } from './dtos/get-admin-project';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private emitter: AppEventEmitter,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async getAdmin(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    return admin;
  }

  private async ensureAdminExists(email: string) {
    const admin = await this.getAdmin(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async verifyPassword(email: string, password: string) {
    const existingPasswordInDB =
      await this.adminRepository.getAdminPassword(email);
    const passwordsMatch = await compare(password, existingPasswordInDB);
    if (!passwordsMatch)
      throw new BadRequestException('Invalid details provided');
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

  @CatchEmitterErrors()
  async loginAdmin({ email, password }: LoginAdminDto) {
    const adminPassword = await this.adminRepository.getAdminPassword(email);
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException(
        'Admin with the provided details does not exist.',
      );
    }
    await checkIfHashedValuesMatch(password, adminPassword);
    const payload = {
      email: admin.email,
      firstName: admin.firstName,
      isVerified: admin.isVerified,
      lastName: admin.lastName,
      id: admin.id,
      role: 'admin',
      mfaEnabled: admin.mfaEnabled,
    };
    const [accessToken, refreshToken] = [
      await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '10d',
      }),
      await generateHashedRefreshToken(),
    ];

    await this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return { success: true, accessToken, refreshToken };
  }

  async updateAdmin({ email, ...details }: UpdateAdminDTO) {
    await this.ensureAdminExists(email);
    const admin = await this.adminRepository.updateAdmin(email, details);
    return { success: true, admin };
  }

  async updateAdminEmail({
    currentEmail,
    newEmail,
    password,
  }: UpdateAdminEmailDto) {
    const existingAdmin = await this.getAdmin(newEmail);
    if (existingAdmin)
      throw new ConflictException(
        'An email with the provided new email already exists. Please choose another.',
      );
    await this.ensureAdminExists(currentEmail);
    await this.verifyPassword(currentEmail, password);
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
    await this.verifyPassword(email, currentPassword);
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
