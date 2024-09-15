import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import {
  LoginWithEmailAndPasswordDto,
  validateNames,
  RegisterWithEmailAndPasswordDto,
  validatePassword,
} from './schema';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AuthMethod } from '@prisma/client';
import { hashValue } from 'src/utils/helper-functions';
import { Request } from 'express';
import { ProjectService } from 'src/project/project.service';
import { LoginService } from 'src/login/login.service';
import { UserService } from 'src/user/user.service';
@Injectable()
export class EmailAndPasswordAuthService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
    private readonly loginService: LoginService,
    private readonly emitter: AppEventEmitter,
  ) {}

  @CatchEmitterErrors()
  async registerWithEmailAndPassword(dto: RegisterWithEmailAndPasswordDto) {
    const {
      allowNames,
      passwordMinLength,
      passwordRequireLowercase,
      passwordRequireNumbers,
      passwordRequireSpecialChars,
      passwordRequireUppercase,
    } = await this.projectService.getProjectSettings(dto.projectId);

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
    return {
      success: true,
      message: 'User registered successfully',
      passwordMinLength,
    };
  }

  @CatchEmitterErrors()
  async loginWithEmailAndPassword(
    { email, password, projectId }: LoginWithEmailAndPasswordDto,
    request: Request,
  ) {
    const { refreshTokenDays, maxLoginAttempts, lockoutDurationMinutes } =
      await this.projectService.getProjectSettings(projectId);
    const existingUser = await this.userService.checkIfUserExists({ email });
    const { user } = await this.userService.getUserProjectDetails({
      userId: existingUser.id,
      projectId,
    });
    if (user?.userStatus === 'BLOCKED') {
      const response =
        await this.loginService.checkIfBlockedUserCanBeAllowedToLogin({
          lockoutDurationMinutes,
          projectId,
          userId: existingUser.id,
        });
      if (response === false) {
        throw new UnauthorizedException(
          'Your account has been temporarily locked.',
        );
      }
    }
    const passwordsMatch = await this.userService.checkIfPasswordsMatch(
      email,
      password,
      projectId,
    );
    if (!passwordsMatch) {
      const { login } = await this.loginService.manageLoginAttempts(
        {
          authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
          ipAddress: request.ip ?? '',
          projectId,
          status: 'FAILURE',
          userAgent: request.headers['user-agent'] ?? '',
          userId: existingUser.id ?? '',
          attempts: 1,
        },
        maxLoginAttempts,
      );
      throw new BadRequestException(
        `'Invalid user details provided. You have ${maxLoginAttempts - login.attempts > 0 ? maxLoginAttempts - login.attempts : 0} attempt(s) left.'`,
      );
    }

    const accessToken = await this.loginService.generateAccessToken(
      {
        email,
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        id: user?.userId,
        isVerified: user?.isVerified,
        role: user?.role?.name,
      },
      projectId,
    );
    const refreshToken = this.loginService.generateRefreshToken();
    await this.loginService.emitRefreshTokenInstanceCreationEvent({
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000,
      ),
      userId: existingUser.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });

    await this.loginService.manageLoginAttempts(
      {
        attempts: 1,
        authMethod: 'EMAIL_AND_PASSWORD_SIGNIN',
        ipAddress: request.ip ?? '',
        projectId,
        status: 'SUCCESS',
        userAgent: request.headers['user-agent'] ?? '',
        userId: existingUser.id,
      },
      maxLoginAttempts,
    );

    return {
      success: true,
      accessToken: `Bearer ${accessToken}`,
      refreshToken,
      refreshTokenDays,
    };
  }
}
