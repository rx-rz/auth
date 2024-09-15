import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMagicLinkDto, TokenDto } from './schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Mailer } from 'src/infra/mail/mail.service';
import { ProjectRepository } from 'src/project/project.repository';
import { UserRepository } from 'src/user/user.repository';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { AuthMethod } from '@prisma/client';
import { CreateLoginInstanceDto } from 'src/login/schema';
import { LoginRepository } from 'src/login/login.repository';
import { Request } from 'express';

type DecodedMagicLink = {
  userEmail: string;
  projectId: string;
};

@Injectable()
export class MagicLinkAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly mailer: Mailer,
    private readonly emitter: AppEventEmitter,
  ) {}

  private async getProjectSettings(projectId: string) {
    const projectSettings =
      await this.projectRepository.getProjectSettings(projectId);
    if (!projectSettings)
      throw new NotFoundException('Project does not exist.');
    return { ...projectSettings };
  }

  async checkIfProjectExists(projectId: string) {
    const project = await this.projectRepository.getProject(projectId);
    if (!project) throw new NotFoundException('Project does not exist.');
    return project;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  }

  async createMagicLink({
    projectId,
    referralLink,
    userEmail,
  }: CreateMagicLinkDto) {
    const { magicLinkTokenAvailabilityMinutes } =
      await this.getProjectSettings(projectId);
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
    const { projectId, userEmail }: DecodedMagicLink =
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    const { lockoutDurationMinutes, maxLoginAttempts } =
      await this.getProjectSettings(projectId);
    let user = await this.userRepository.getUserProjectDetailsByEmail(
      userEmail,
      projectId,
    );
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    if (user?.userStatus === 'BLOCKED') {
      const response = await this.checkIfBlockedUserCanBeAllowedToLogin({
        lockoutDurationMinutes,
        projectId,
        userId: user.user.id,
      });
      if (response === false) {
        throw new UnauthorizedException(
          'Your account has been temporarily locked.',
        );
      }
    }
    if (user?.isVerified === false) {
      await this.userRepository.updateUserProjectDetails(
        user.user.id,
        projectId,
        {
          isVerified: true,
        },
      );
    }
    const payload = {
      email: userEmail,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      isVerified: true,
      id: user?.user.id,
      role: user?.role?.name,
    };

    const [accessToken, refreshToken] = [
      await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      generateHashedRefreshToken(),
    ];

    this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user?.user.id,
      authMethod: AuthMethod.MAGICLINK,
    });

    await this.manageLoginAttempts(
      {
        attempts: 1,
        authMethod: 'MAGICLINK',
        ipAddress: request.ip ?? '',
        projectId,
        status: 'SUCCESS',
        userAgent: request.headers['user-agent'] ?? '',
        userId: user?.user.id ?? '',
      },
      maxLoginAttempts,
    );
    return { success: true, accessToken };
  }

  private async checkIfBlockedUserCanBeAllowedToLogin({
    userId,
    projectId,
    lockoutDurationMinutes,
  }: {
    userId: string;
    projectId: string;
    lockoutDurationMinutes: number;
  }) {
    const userAddedToBlocklist =
      await this.projectRepository.getUserFromProjectBlocklist(
        userId,
        projectId,
      );
    if (
      //check if the current date has exceeded the date the user was added to blocklist combined with the lockout duration.
      new Date(userAddedToBlocklist?.createdAt ?? '').getTime() +
        60_000 * lockoutDurationMinutes <
      Date.now()
    ) {
      await this.projectRepository.removeUserFromBlocklist(userId, projectId);
      return true;
    }
    return false;
  }

  private async manageLoginAttempts(
    dto: CreateLoginInstanceDto,
    maxLoginAttempts: number,
  ) {
    if (dto.status === 'FAILURE') {
      const previousLogin =
        await this.loginRepository.getLatestLoginInstanceForUser(dto.userId);
      const login = await this.loginRepository.createLoginInstance({
        ...dto,
        //adding an extra attempt to the already existing attempt
        attempts: previousLogin ? previousLogin.attempts + 1 : 1,
      });
      if (login.attempts >= maxLoginAttempts) {
        await this.projectRepository.addUserToBlocklist(
          dto.userId,
          dto.projectId,
        );
        return { status: 'blocked', login };
      }
      return { status: 'allowed', login };
    } else {
      const login = await this.loginRepository.createLoginInstance(dto);
      return { status: 'allowed', login };
    }
  }
}
