import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import {
  RegisterAdminDto,
  UpdateAdminDto,
  GetAdminProjectDto,
  LoginAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
  AdminEmailDto,
} from './schema';
import { AuthMethod } from '@prisma/client';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private emitter: AppEventEmitter,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async getAdminByEmail(email: string) {
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async getAdminById(id: string) {
    const admin = await this.adminRepository.getAdminByID(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async verifyPassword(email: string, password: string) {
    const existingPasswordInDB = await this.adminRepository.getAdminPassword(email);
    const passwordsMatch = await compare(password, existingPasswordInDB);
    if (!passwordsMatch) throw new BadRequestException('Invalid details provided');
    return passwordsMatch;
  }

  async registerAdmin(data: RegisterAdminDto) {
    const admin = await this.adminRepository.getAdminByEmail(data.email);
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
    const admin = await this.adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new NotFoundException('Admin with the provided details does not exist.');
    }
    await this.verifyPassword(email, password);
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

  async updateAdmin({ email, ...details }: UpdateAdminDto) {
    await this.getAdminByEmail(email);
    const admin = await this.adminRepository.updateAdmin(email, details);
    return { success: true, admin };
  }

  async updateAdminEmail({ currentEmail, newEmail, password }: UpdateAdminEmailDto) {
    const existingAdmin = await this.adminRepository.getAdminByEmail(newEmail);
    if (existingAdmin)
      throw new ConflictException(
        'An email with the provided new email already exists. Please choose another.',
      );
    await this.getAdminByEmail(currentEmail);
    await this.verifyPassword(currentEmail, password);
    const admin = await this.adminRepository.updateAdminEmail(currentEmail, newEmail);
    return { success: true, admin };
  }

  async updateAdminPassword({ currentPassword, email, newPassword }: UpdateAdminPasswordDto) {
    await this.getAdminByEmail(email);
    await this.verifyPassword(email, currentPassword);
    const admin = await this.adminRepository.updateAdminPassword(email, newPassword);
    return { success: true, admin };
  }

  async getAdminProjects({ email }: AdminEmailDto) {
    await this.getAdminByEmail(email);
    const adminProjects = await this.adminRepository.getAdminProjects(email);
    return { success: true, adminProjects };
  }

  async getAdminProjectByName({ adminId, name }: GetAdminProjectDto) {
    await this.getAdminById(adminId);
    const adminProject = await this.adminRepository.getAdminProjectByName(adminId, name);
    return { success: true, adminProject };
  }

  async deleteAdmin({ email }: AdminEmailDto) {
    await this.getAdminByEmail(email);
    const admin = await this.adminRepository.deleteAdmin(email);
    return { success: true, admin };
  }
}
