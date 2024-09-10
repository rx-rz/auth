import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { compare } from 'bcryptjs';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { generateAccessToken } from 'src/utils/helper-functions/generate-access-token';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import {
  LoginWithEmailAndPasswordDto,
  validateNames,
  validateUsername,
  RegisterWithEmailAndPasswordDto,
  validatePassword,
  LoginWithUsernameAndPasswordDto,
} from './schema';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AuthMethod } from '@prisma/client';
import { ProjectRepository } from 'src/project/project.repository';
import { hashValue } from 'src/utils/helper-functions';
import { Request } from 'express';
import { CreateLoginInstanceDto } from 'src/login/schema';
import { StoreRefreshTokenDto } from 'src/refresh-token/schema';
@Injectable()
export class EmailAndPasswordAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emitter: AppEventEmitter,
    private readonly projectRepository: ProjectRepository,
  ) {}

  private async getProjectSettings(projectId: string) {
    const projectSettings = await this.projectRepository.getProjectSettings(projectId);
    if (!projectSettings) throw new NotFoundException('Project does not exist.');
    return { ...projectSettings };
  }

  private async checkIfUserExists(
    identifier: { email?: string; username?: string },
    projectId: string,
    request?: Request,
  ) {
    let userDetails;

    if (identifier.email) {
      userDetails = await this.userRepository.getUserProjectDetailsByEmail(
        identifier.email,
        projectId,
      );
    }
    if (identifier.username) {
      userDetails = await this.userRepository.getUserProjectDetailsByUsername(
        identifier.username,
        projectId,
      );
    }
    if (!userDetails) {
      await this.emitLoginInstanceCreationEvent({
        authMethod: identifier.email
          ? AuthMethod.EMAIL_AND_PASSWORD_SIGNIN
          : AuthMethod.USERNAME_AND_PASSWORD_SIGNIN,
        ipAddress: request?.ip ?? '',
        projectId,
        status: 'FAILURE',
        userAgent: request?.headers['user-agent'] ?? '',
        email: identifier.email ?? '',
        username: identifier.username ?? '',
      });
      throw new NotFoundException('Invalid user details provided');
    }

    return userDetails;
  }

  private async checkIfPasswordsMatch(
    identifier: { email?: string; username?: string },
    password: string,
    projectId: string,
    request?: Request,
  ) {
    const { email, username } = identifier;
    let userPasswordInDB: string | null = null;

    if (email) {
      userPasswordInDB = await this.userRepository.getUserPasswordByEmail(email, projectId);
    } else if (username) {
      userPasswordInDB = await this.userRepository.getUserPasswordByUsername(username, projectId);
    }

    if (!userPasswordInDB || !(await compare(password, userPasswordInDB))) {
      await this.emitLoginInstanceCreationEvent({
        authMethod: identifier.email
          ? AuthMethod.EMAIL_AND_PASSWORD_SIGNIN
          : AuthMethod.USERNAME_AND_PASSWORD_SIGNIN,
        ipAddress: request?.ip ?? '',
        projectId,
        status: 'FAILURE',
        userAgent: request?.headers['user-agent'] ?? '',
        email: identifier.email ?? '',
        username: identifier.username ?? '',
      });
      throw new BadRequestException('Invalid user details provided.');
    }

    return true;
  }

  @CatchEmitterErrors()
  async registerWithEmailAndPassword(dto: RegisterWithEmailAndPasswordDto) {
    const {
      allowUsername,
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

    if (allowUsername) {
      validateUsername(dto.username ?? '');
      const existingUserWithUsername = await this.userRepository.getUserProjectDetailsByUsername(
        dto.username ?? '',
        dto.projectId,
      );
      if (existingUserWithUsername) throw new ConflictException('Username is already taken');
    }

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
    await this.checkIfPasswordsMatch({ email }, password, projectId, request);
    const { firstName, lastName, role, isVerified, user } = await this.checkIfUserExists(
      { email },
      projectId,
      request,
    );
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
    const { refreshTokenDays } = await this.getProjectSettings(projectId);
    await this.emitRefreshTokenInstanceCreationEvent({
      token: refreshToken,
      expiresAt: new Date(Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.USERNAME_AND_PASSWORD_SIGNIN,
    });
    await this.emitLoginInstanceCreationEvent({
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
      ipAddress: request.ip ?? '',
      projectId,
      status: 'SUCCESS',
      userAgent: request?.headers['user-agent'] ?? '',
      email,
      username: '',
    });
    return { success: true, accessToken: `Bearer ${accessToken}`, refreshToken, refreshTokenDays };
  }

  @CatchEmitterErrors()
  async loginWithUsernameAndPassword(
    { password, projectId, username }: LoginWithUsernameAndPasswordDto,
    request: Request,
  ) {
    await this.checkIfPasswordsMatch({ username }, password, projectId, request);
    const { firstName, lastName, role, isVerified, user } = await this.checkIfUserExists(
      { username },
      projectId,
      request,
    );
    const [accessToken, refreshToken] = [
      generateAccessToken({
        email: user.email,
        firstName: firstName ?? '',
        isVerified,
        lastName: lastName ?? '',
        id: user.id,
        role: role?.name || '',
        username,
      }),
      generateHashedRefreshToken(),
    ];
    const { refreshTokenDays } = await this.getProjectSettings(projectId);
    await this.emitRefreshTokenInstanceCreationEvent({
      token: refreshToken,
      expiresAt: new Date(Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.USERNAME_AND_PASSWORD_SIGNIN,
    });
    await this.emitLoginInstanceCreationEvent({
      authMethod: AuthMethod.USERNAME_AND_PASSWORD_SIGNIN,
      ipAddress: request.ip ?? '',
      projectId,
      status: 'SUCCESS',
      userAgent: request?.headers['user-agent'] ?? '',
      email: '',
      username,
    });
    return { success: true, accessToken: `Bearer ${accessToken}`, refreshToken, refreshTokenDays };
  }

  private async emitLoginInstanceCreationEvent(dto: CreateLoginInstanceDto) {
    await this.emitter.emit('login.create-login-instance', dto);
  }
  private async emitRefreshTokenInstanceCreationEvent(dto: StoreRefreshTokenDto) {
    await this.emitter.emit('refresh-token.created', dto);
  }
}
