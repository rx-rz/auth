import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import {
  RegisterAdminDto,
  UpdateAdminDto,
  GetAdminProjectDto,
  LoginAdminDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
  AdminEmailDto,
  ResetAdminPasswordDto,
} from './schema';
import { AuthMethod } from '@prisma/client';
import { compare } from 'bcryptjs';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { LoginService } from 'src/login/login.service';

export type Admin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  mfaEnabled: boolean;
};

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly emitter: AppEventEmitter,
    private loginService: LoginService,
  ) {}

  async checkIfAdminExists({ id, email }: { id?: string; email?: string }) {
    const admin = id
      ? await this.adminRepository.getAdminByID(id)
      : await this.adminRepository.getAdminByEmail(email ?? '');
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async verifyPassword(email: string, password: string) {
    const existingPasswordInDB =
      await this.adminRepository.getAdminPassword(email);
    const passwordsMatch = await compare(password, existingPasswordInDB);
    if (!passwordsMatch) throw new BadRequestException('Password is incorrect');
    return passwordsMatch;
  }

  async registerAdmin({ email, password, ...dto }: RegisterAdminDto) {
    const admin = await this.checkIfAdminExists({ email });
    if (admin) throw new ConflictException('Admin already created.');
    await this.adminRepository.createAdmin({
      ...dto,
      email,
      password: await hashValue(password),
    });
    return { success: true, message: 'Admin registered successfully.' };
  }

  @CatchEmitterErrors()
  async loginAdmin({ email, password }: LoginAdminDto) {
    const admin = await this.checkIfAdminExists({ email });
    await this.verifyPassword(email, password);
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    const refreshToken = this.loginService.generateRefreshToken();
    await this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return {
      success: true,
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
    };
  }

  async updateAdmin({ email, ...dto }: UpdateAdminDto) {
    await this.checkIfAdminExists({ email });
    const admin = await this.adminRepository.updateAdmin(email, dto);
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return { success: true, admin, accessToken: `Bearer ${accessToken}` };
  }

  async updateAdminEmail({
    currentEmail,
    newEmail,
    password,
  }: UpdateAdminEmailDto) {
    const existingAdmin = await this.checkIfAdminExists({ email: newEmail });
    if (existingAdmin)
      throw new ConflictException(
        'An email with the provided new email already exists. Please choose another.',
      );

    await this.checkIfAdminExists({ email: currentEmail });
    await this.verifyPassword(currentEmail, password);
    const admin = await this.adminRepository.updateAdminEmail(
      currentEmail,
      newEmail,
    );
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return { success: true, admin, accessToken: `Bearer ${accessToken}` };
  }

  async updateAdminPassword({
    currentPassword,
    email,
    newPassword,
  }: UpdateAdminPasswordDto) {
    const admin = await this.checkIfAdminExists({ email });
    await this.verifyPassword(email, currentPassword);
    const hashedPassword = await hashValue(newPassword);
    await this.adminRepository.updateAdminPassword(email, hashedPassword);
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return { success: true, accessToken: `Bearer ${accessToken}` };
  }

  async resetAdminPassword({ email, newPassword }: ResetAdminPasswordDto) {
    await this.checkIfAdminExists({ email });
    const admin = await this.adminRepository.updateAdminPassword(
      email,
      newPassword,
    );
    return { success: true, admin };
  }

  async getAdminProjects({ email }: AdminEmailDto) {
    await this.checkIfAdminExists({ email });
    const adminProjects = await this.adminRepository.getAdminProjects(email);
    return { success: true, adminProjects };
  }

  async getAdminProjectByName({ adminId, name }: GetAdminProjectDto) {
    await this.checkIfAdminExists({ id: adminId });
    const adminProject = await this.adminRepository.getAdminProjectByName(
      adminId,
      name,
    );
    return { success: true, adminProject };
  }

  async deleteAdmin({ email }: AdminEmailDto) {
    await this.checkIfAdminExists({ email });
    const admin = await this.adminRepository.deleteAdmin(email);
    return { success: true, admin };
  }

  private getAdminPayload(admin: Admin) {
    return {
      email: admin.email,
      firstName: admin.firstName,
      id: admin.id,
      isVerified: admin.isVerified,
      isAdmin: true,
      lastName: admin.lastName,
      mfaEnabled: admin.mfaEnabled,
      role: 'rollo-admin',
    };
  }
}
