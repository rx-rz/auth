import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import * as Dtos from './schema';
import { compare } from 'bcryptjs';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { LoginService } from 'src/login/login.service';
import { Mailer } from 'src/infra/mail/mail.service';
import { randomUUID } from 'crypto';

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
    private loginService: LoginService,
    private refreshTokenService: RefreshTokenService,
    private mailer: Mailer,
  ) {}

  async checkIfAdminExists({ id, email }: { id?: string; email?: string }) {
    const admin = id
      ? await this.adminRepository.getAdminByID({ adminId: id })
      : await this.adminRepository.getAdminByEmail({ email: email ?? '' });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  private async verifyPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const existingPasswordInDB = await this.adminRepository.getAdminPassword({
      email,
    });
    const passwordsMatch = await compare(password, existingPasswordInDB);
    if (!passwordsMatch) throw new BadRequestException('Password is incorrect');
    return passwordsMatch;
  }

  async registerAdmin({ email, password, ...dto }: Dtos.RegisterAdminDto) {
    const admin = await this.adminRepository.getAdminByEmail({ email });
    if (admin) throw new ConflictException('Admin already created.');
    await this.adminRepository.createAdmin({
      ...dto,
      email,
      password: await hashValue(password),
    });
    return { success: true, message: 'Admin registered successfully.' };
  }

  async loginAdmin({ email, password }: Dtos.LoginAdminDto) {
    const admin = await this.checkIfAdminExists({ email });
    await this.verifyPassword({ email, password });
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    const refreshToken = this.loginService.generateRefreshToken();
    await this.refreshTokenService.storeAdminRefreshToken({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
    });
    return {
      success: true,
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
    };
  }

  async updateAdmin({ email, ...dto }: Dtos.UpdateAdminDto) {
    await this.checkIfAdminExists({ email });
    const admin = await this.adminRepository.updateAdmin({ email, ...dto });
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return {
      success: true,
      message: 'Admin details updated successfully',
      accessToken: `Bearer ${accessToken}`,
    };
  }

  async updateAdminEmail({
    currentEmail,
    newEmail,
    password,
  }: Dtos.UpdateAdminEmailDto) {
    const existingAdmin = await this.adminRepository.getAdminByEmail({
      email: newEmail,
    });
    if (existingAdmin)
      throw new ConflictException(
        'An email with the provided new email already exists. Please choose another email.',
      );

    await this.checkIfAdminExists({ email: currentEmail });
    await this.verifyPassword({ email: currentEmail, password });
    const admin = await this.adminRepository.updateAdminEmail({
      currentEmail,
      newEmail,
    });
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return { success: true, admin, accessToken: `Bearer ${accessToken}` };
  }

  async updateAdminPassword({
    currentPassword,
    email,
    newPassword,
  }: Dtos.UpdateAdminPasswordDto) {
    const admin = await this.checkIfAdminExists({ email });
    await this.verifyPassword({ email, password: currentPassword });
    const hashedPassword = await hashValue(newPassword);
    await this.adminRepository.updateAdminPassword({
      email,
      newPassword: hashedPassword,
    });
    const payload = this.getAdminPayload(admin);
    const accessToken = await this.loginService.generateAccessToken(payload);
    return { success: true, accessToken: `Bearer ${accessToken}` };
  }

  async sendPasswordResetToken({ email, link }: Dtos.GetResetTokenDto) {
    await this.checkIfAdminExists({ email });
    const token = randomUUID();
    const tokenExpiration = new Date(Date.now() + 1000 * 60 * 10);
    await this.adminRepository.updatePasswordResetTokens({
      token,
      tokenExpiration,
      email,
    });
    const resetLink = `${link}?token=${token}`;
    const { error } = await this.mailer.sendEmail({
      recipients: [email],
      subject: 'Auth Magic Link',
      from: 'adeleyetemiloluwa.work@gmail.com',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });
    if (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occured when sending the mail.',
      );
    }
    return {
      success: true,
      message: 'Reset link sent to your email',
      resetLink,
    };
  }

  async resetAdminPassword({
    email,
    newPassword,
    token,
  }: Dtos.ResetAdminPasswordDto) {
    await this.checkIfAdminExists({ email });
    const tokens = await this.adminRepository.getAdminPasswordResetTokens({
      email,
    });
    if (
      tokens?.resetToken !== token &&
      tokens?.resetTokenExpiration &&
      new Date(tokens.resetTokenExpiration).getTime() > Date.now()
    ) {
      throw new BadRequestException('Password reset token is invalid');
    }
    await Promise.all([
      this.adminRepository.updateAdminPassword({
        email,
        newPassword: await hashValue(newPassword),
      }),
      this.adminRepository.updatePasswordResetTokens({
        email,
        token: '',
        tokenExpiration: new Date(Date.now()),
      }),
    ]);
    return { success: true, message: 'Password reset successfully' };
  }

  async getAdminProjects({ email }: Dtos.AdminEmailDto) {
    await this.checkIfAdminExists({ email });
    const adminProjects = await this.adminRepository.getAdminProjects({
      email,
    });
    return { success: true, adminProjects };
  }

  async getAdminProjectByName({ adminId, name }: Dtos.GetAdminProjectDto) {
    await this.checkIfAdminExists({ id: adminId });
    const adminProject = await this.adminRepository.getAdminProjectByName({
      adminId,
      name,
    });
    return { success: true, adminProject };
  }

  async deleteAdmin({ email }: Dtos.AdminEmailDto) {
    await this.checkIfAdminExists({ email });
    const admin = await this.adminRepository.deleteAdmin({ email });
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
