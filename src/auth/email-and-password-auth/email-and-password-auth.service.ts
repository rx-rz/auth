import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { compare } from 'bcryptjs';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { generateAccessToken } from 'src/utils/helper-functions/generate-access-token';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import {
  LoginWithEmailAndPasswordDto,
  validateNames,
  RegisterWithEmailAndPasswordDto,
  validatePassword,
} from './schema';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AuthMethod } from '@prisma/client';
import { ProjectRepository } from 'src/project/project.repository';
import { hashValue } from 'src/utils/helper-functions';
import { Request } from 'express';
import { CreateLoginInstanceDto } from 'src/login/schema';
import { StoreRefreshTokenDto } from 'src/refresh-token/schema';
import { LoginRepository } from 'src/login/login.repository';
@Injectable()
export class EmailAndPasswordAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emitter: AppEventEmitter,
    private readonly projectRepository: ProjectRepository,
    private readonly loginRepository: LoginRepository,
  ) {}

  private async getProjectSettings(projectId: string) {
    const projectSettings = await this.projectRepository.getProjectSettings(projectId);
    if (!projectSettings) throw new NotFoundException('Project does not exist.');
    return { ...projectSettings };
  }

  private async checkIfUserExists({ email, projectId }: { email: string; projectId: string }) {
    const userDetails = await this.userRepository.getUserProjectDetailsByEmail(email, projectId);
    if (!userDetails) {
      throw new NotFoundException('Invalid user details provided');
    }
    return userDetails;
  }

  private async checkIfPasswordsMatch({
    email,
    projectId,
    password,
  }: {
    email: string;
    projectId: string;
    password: string;
  }) {
    const userPasswordInDB = await this.userRepository.getUserPasswordByEmail(email, projectId);
    return typeof userPasswordInDB === 'string' && (await compare(password, userPasswordInDB));
  }

  @CatchEmitterErrors()
  async registerWithEmailAndPassword(dto: RegisterWithEmailAndPasswordDto) {
    const {
      allowNames,
      passwordMinLength,
      passwordRequireLowercase,
      passwordRequireNumbers,
      passwordRequireSpecialChars,
      passwordRequireUppercase,
    } = await this.getProjectSettings(dto.projectId);

    validatePassword(dto.password, {
      passwordMinLength,
      passwordRequireLowercase,
      passwordRequireNumbers,
      passwordRequireSpecialChars,
      passwordRequireUppercase,
    });

    if (allowNames) {
      validateNames(dto.firstName ?? '', dto.lastName ?? '');
    }
    const userToBeCreated = dto.password
      ? { ...dto, password: await hashValue(dto.password) }
      : dto;
    await this.emitter.emit('user-create.email-password', userToBeCreated);
    return { success: true, message: 'User registered successfully', passwordMinLength };
  }

  @CatchEmitterErrors()
  async loginWithEmailAndPassword(
    { email, password, projectId }: LoginWithEmailAndPasswordDto,
    request: Request,
  ) {
    const { refreshTokenDays, maxLoginAttempts, lockoutDurationMinutes } =
      await this.getProjectSettings(projectId);
    const { firstName, lastName, role, isVerified, user, userStatus } =
      await this.checkIfUserExists({
        email,
        projectId,
      });
    if (userStatus === 'BLOCKED') {
      const response = await this.checkIfBlockedUserCanBeAllowedToLogin({
        lockoutDurationMinutes,
        projectId,
        userId: user.id,
      });
      if (response === false) {
        throw new UnauthorizedException('Your account has been temporarily locked.');
      }
    }
    const passwordsMatch = await this.checkIfPasswordsMatch({
      email,
      password,
      projectId,
    });
    if (!passwordsMatch) {
      const { login } = await this.manageLoginAttempts(
        {
          authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
          ipAddress: request.ip ?? '',
          projectId,
          status: 'FAILURE',
          userAgent: request.headers['user-agent'] ?? '',
          userId: user?.id ?? '',
          attempts: 1,
        },
        maxLoginAttempts,
      );
      throw new BadRequestException(
        `'Invalid user details provided. You have ${maxLoginAttempts - login.attempts > 0 ? maxLoginAttempts - login.attempts : 0} attempt(s) left.'`,
      );
    }
    const [accessToken, refreshToken] = [
      generateAccessToken({
        email,
        firstName: firstName ?? '',
        isVerified,
        lastName: lastName ?? '',
        id: user.id,
        role: role?.name || '',
      }),
      generateHashedRefreshToken(),
    ];

    await this.emitRefreshTokenInstanceCreationEvent({
      token: refreshToken,
      expiresAt: new Date(Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });

    await this.manageLoginAttempts(
      {
        attempts: 1,
        authMethod: 'EMAIL_AND_PASSWORD_SIGNIN',
        ipAddress: request.ip ?? '',
        projectId,
        status: 'SUCCESS',
        userAgent: request.headers['user-agent'] ?? '',
        userId: user.id,
      },
      maxLoginAttempts,
    );

    return { success: true, accessToken: `Bearer ${accessToken}`, refreshToken, refreshTokenDays };
  }

  private async emitRefreshTokenInstanceCreationEvent(dto: StoreRefreshTokenDto) {
    await this.emitter.emit('refresh-token.created', dto);
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
    const userAddedToBlocklist = await this.projectRepository.getUserFromProjectBlocklist(
      userId,
      projectId,
    );
    if (
      //check if the current date has exceeded the date the user was added to blocklist combined with the lockout duration.
      new Date(userAddedToBlocklist?.createdAt ?? '').getTime() + 60_000 * lockoutDurationMinutes <
      Date.now()
    ) {
      await this.projectRepository.removeUserFromBlocklist(userId, projectId);
      return true;
    }
    return false;
  }

  private async manageLoginAttempts(dto: CreateLoginInstanceDto, maxLoginAttempts: number) {
    if (dto.status === 'FAILURE') {
      const previousLogin = await this.loginRepository.getLatestLoginInstanceForUser(dto.userId);
      const login = await this.loginRepository.createLoginInstance({
        ...dto,
        //adding an extra attempt to the already existing attempt
        attempts: previousLogin ? previousLogin.attempts + 1 : 1,
      });
      if (login.attempts >= maxLoginAttempts) {
        await this.projectRepository.addUserToBlocklist(dto.userId, dto.projectId);
        return { status: 'blocked', login };
      }
      return { status: 'allowed', login };
    } else {
      const login = await this.loginRepository.createLoginInstance(dto);
      return { status: 'allowed', login };
    }
  }
}
