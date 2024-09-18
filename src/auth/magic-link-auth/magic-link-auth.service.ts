import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMagicLinkDto, TokenDto } from './schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Mailer } from 'src/infra/mail/mail.service';
import { Request } from 'express';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { LoginService } from 'src/login/login.service';

type DecodedMagicLink = {
  userEmail: string;
  projectId: string;
};

@Injectable()
export class MagicLinkAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly loginService: LoginService,
    private readonly projectService: ProjectService,
    private readonly mailer: Mailer,
  ) {}

  async createMagicLink({
    projectId,
    referralLink,
    userEmail,
  }: CreateMagicLinkDto) {
    const { magicLinkTokenAvailabilityMinutes } =
      await this.projectService.getProjectSettings(projectId);
    const payload = { userEmail, projectId };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: `${magicLinkTokenAvailabilityMinutes}m`,
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });
    const link = `${referralLink}/verify?token=${token}`;
    const { error } = await this.mailer.sendEmail({
      recipients: [userEmail],
      subject: 'Auth Magic Link',
      from: 'adeleyetemiloluwa.work@gmail.com',
      html: `
        <p>Click the link below to login:</p>
        <a href="${link}">${link}</a>
      `,
    });
    if (error) throw error;
    return { success: true, link };
  }

  async verifyMagicLink({ token }: TokenDto, request: Request) {
    const { projectId, userEmail } =
      await this.loginService.decodeAccessToken<DecodedMagicLink>(token);
    console.log({ projectId, userEmail });
    const { lockoutDurationMinutes, maxLoginAttempts, refreshTokenDays } =
      await this.projectService.getProjectSettings(projectId);
    const { user } = await this.userService.getUserProjectDetails({
      projectId,
      email: userEmail ?? '',
    });
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    if (user?.userStatus === 'BLOCKED') {
      const response =
        await this.loginService.checkIfBlockedUserCanBeAllowedToLogin({
          lockoutDurationMinutes,
          projectId,
          userId: user.userId,
        });
      if (response === false) {
        throw new UnauthorizedException(
          'Your account has been temporarily locked.',
        );
      }
    }
    if (user?.isVerified === false) {
      await this.userService.updateUserProjectDetails({
        projectId,
        userId: user.userId,
        isVerified: true,
      });
    }
    const accessToken = await this.loginService.generateAccessToken(
      {
        email: user.user.email,
        id: user.userId,
        firstName: user.firstName ?? '',
        isVerified: true,
        lastName: user.lastName ?? '',
        role: user.role?.name ?? '',
      },
      projectId,
    );
    const refreshToken = this.loginService.generateRefreshToken();
    await this.loginService.manageLoginAttempts(
      {
        attempts: 1,
        authMethod: 'MAGICLINK',
        ipAddress: request.ip ?? '',
        projectId,
        status: 'SUCCESS',
        userAgent: request.headers['user-agent'] ?? '',
        userId: user?.userId ?? '',
      },
      maxLoginAttempts,
    );
    return { success: true, accessToken, refreshToken, refreshTokenDays };
  }
}
