import { Injectable, NotFoundException, UsePipes } from '@nestjs/common';
import { LoginRepository } from './login.repository';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CreateLoginInstanceDto,
  CreateLoginInstanceSchema,
  LoginIdDto,
  LoginIdSchema,
} from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { ProjectService } from 'src/project/project.service';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { StoreRefreshTokenDto } from 'src/refresh-token/schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

type Payload = {
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  id: string;
  role: string;
  mfaEnabled?: boolean;
  isAdmin?: boolean;
};

@Injectable()
export class LoginService {
  constructor(
    private readonly loginRepository: LoginRepository,
    private readonly projectService: ProjectService,
    private readonly emitter: AppEventEmitter,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async checkIfLoginInstanceExists(id: string) {
    const login = await this.loginRepository.getLoginInstance(id);
    if (!login) throw new NotFoundException('Login instance not found');
  }

  async emitRefreshTokenInstanceCreationEvent(dto: StoreRefreshTokenDto) {
    await this.emitter.emit('refresh-token.created', dto);
  }

  async saveRefreshTokenInDB(dto: StoreRefreshTokenDto){
    
  }

  async generateAccessToken(payload: Partial<Payload>, projectId?: string) {
    if (projectId && payload.isAdmin === false) {
      const { accessTokenMinutes } =
        await this.projectService.getProjectSettings(projectId ?? '');
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: payload.isAdmin ? '15m' : `${accessTokenMinutes}m`,
      });
      return accessToken;
    }
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    return accessToken;
  }

  async decodeAccessToken<T>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    }) as T;
  }

  generateRefreshToken(bytes = 32) {
    const buffer = randomBytes(bytes);
    const token = buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return token;
  }

  async checkIfBlockedUserCanBeAllowedToLogin({
    userId,
    projectId,
    lockoutDurationMinutes,
  }: {
    userId: string;
    projectId: string;
    lockoutDurationMinutes: number;
  }) {
    const userAddedToBlocklist =
      await this.projectService.handleProjectBlocklistOperation(
        'get',
        userId,
        projectId,
      );
    if (
      //check if the current date has exceeded the date the user was added to blocklist combined with the lockout duration.
      new Date(userAddedToBlocklist?.createdAt ?? '').getTime() +
        60_000 * lockoutDurationMinutes <
      Date.now()
    ) {
      await this.projectService.handleProjectBlocklistOperation(
        'remove',
        userId,
        projectId,
      );
      return true;
    }
    return false;
  }

  async manageLoginAttempts(
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
        await this.projectService.handleProjectBlocklistOperation(
          'add',
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

  @OnEvent('login.create-login-instance')
  @UsePipes(new ZodPipe(CreateLoginInstanceSchema))
  async createLoginInstance(body: CreateLoginInstanceDto) {
    const login = await this.loginRepository.createLoginInstance(body);
    return { success: true, login };
  }

  @UsePipes(new ZodPipe(LoginIdSchema))
  async deleteLoginInstance({ loginId }: LoginIdDto) {
    await this.checkIfLoginInstanceExists(loginId);
    const login = this.loginRepository.deleteLoginInstance(loginId);
    return { success: true, login };
  }
}
