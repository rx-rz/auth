import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { compare } from 'bcryptjs';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { generateAccessToken } from 'src/utils/helper-functions/generate-access-token';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { LoginWithEmailAndPasswordDto, RegisterWithEmailAndPasswordDto } from './schema';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import { AuthMethod } from '@prisma/client';
@Injectable()
export class EmailAndPasswordAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emitter: AppEventEmitter,
  ) {}

  private async getUserProjectDetails(email: string, projectId: string) {
    const userDetails = await this.userRepository.getUserProjectDetailsByEmail(email, projectId);
    if (!userDetails) throw new NotFoundException('Invalid details provided.');
    return userDetails;
  }

  private async checkIfUserExists(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  private async checkIfPasswordsMatch(email: string, password: string, projectId: string) {
    const userPasswordInDB = await this.userRepository.getUserPassword(email, projectId);
    if (!userPasswordInDB) throw new BadRequestException('Invalid user details provided.');
    const passwordsMatch = await compare(password, userPasswordInDB);
    if (passwordsMatch === false) {
      throw new BadRequestException('Invalid user details provided');
    }
    return true;
  }

  @CatchEmitterErrors()
  async registerWithEmailAndPassword(dto: RegisterWithEmailAndPasswordDto) {
    await this.emitter.emit('user-create.email-password', dto);
    return { success: true, message: 'User registered successfully' };
  }

  @CatchEmitterErrors()
  async loginWithEmailAndPassword({ email, password, projectId }: LoginWithEmailAndPasswordDto) {
    if (!projectId) throw new BadRequestException('Project ID not provided');
    // since the getUserProjectDetailsByEmail() repository function
    // used in getUserProjectDetails allows undefined values for
    // projectId, it has to be checked
    const user = await this.checkIfUserExists(email);
    await this.checkIfPasswordsMatch(email, password, projectId);
    
    const { firstName, lastName, role, isVerified } = await this.getUserProjectDetails(
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
      await generateHashedRefreshToken(),
    ];
    await this.emitter.emit('refresh-token.created', {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user.id,
      authMethod: AuthMethod.EMAIL_AND_PASSWORD_SIGNIN,
    });
    return { success: true, accessToken, refreshToken };
  }
}
