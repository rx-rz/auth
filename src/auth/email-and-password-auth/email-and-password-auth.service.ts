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

  private async checkIfUserWithEmailExists(email: string, projectId: string) {
    const userDetails = await this.userRepository.getUserProjectDetailsByEmail(email, projectId);
    if (!userDetails) throw new NotFoundException('Invalid details provided.');
    return userDetails;
  }

  private async checkIfUserWithUsernameExists(username: string, projectId: string) {
    const user = await this.userRepository.getUserProjectDetailsByUsername(username, projectId);
    if (!user) throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  private async checkIfPasswordsMatchUsingEmail(
    email: string,
    password: string,
    projectId: string,
  ) {
    const userPasswordInDB = await this.userRepository.getUserPasswordByEmail(email, projectId);
    if (!userPasswordInDB) throw new BadRequestException('Invalid user details provided.');
    const passwordsMatch = await compare(password, userPasswordInDB);
    if (passwordsMatch === false) {
      throw new BadRequestException('Invalid user details provided');
    }
    return true;
  }

  private async checkIfPasswordsMatchUsingUsername(
    username: string,
    password: string,
    projectId: string,
  ) {
    const userPasswordInDB = await this.userRepository.getUserPasswordByUsername(
      username,
      projectId,
    );
    if (!userPasswordInDB) throw new BadRequestException('Invalid user details provided.');
    const passwordsMatch = await compare(password, userPasswordInDB);
    if (passwordsMatch === false) {
      throw new BadRequestException('Invalid user details provided');
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
  async loginWithEmailAndPassword({ email, password, projectId }: LoginWithEmailAndPasswordDto) {
    await this.checkIfPasswordsMatchUsingEmail(email, password, projectId);
    const { firstName, lastName, role, isVerified, user } = await this.checkIfUserWithEmailExists(
      email,
      projectId,
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
    await this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return { success: true, accessToken: `Bearer ${accessToken}`, refreshToken, refreshTokenDays };
  }

  async loginWithUsernameAndPassword({
    password,
    projectId,
    username,
  }: LoginWithUsernameAndPasswordDto) {
    await this.checkIfPasswordsMatchUsingUsername(username, password, projectId);
    const { firstName, lastName, role, isVerified, user } =
      await this.checkIfUserWithUsernameExists(username, projectId);
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
    await this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + (refreshTokenDays ?? 7) * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return { success: true, accessToken: `Bearer ${accessToken}`, refreshToken, refreshTokenDays };
  }
}
