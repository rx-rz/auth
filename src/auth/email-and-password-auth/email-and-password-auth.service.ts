import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { RegisterWithEmailAndPasswordDto } from './dtos/register-with-email-and-password-dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginWithEmailAndPasswordDto } from './dtos/login-with-email-and-password-dto';
import { compare } from 'bcryptjs';
import { generateHashedRefreshToken } from 'src/utils/helper-functions/generate-hashed-refresh-token';
import { generateAccessToken } from 'src/utils/helper-functions/generate-access-token';

@Injectable()
export class EmailAndPasswordAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // private async checkIfUserExistsInProject(userId: string, projectId: string) {
  //   const user = await this.userRepository.ge;
  // }

  // private async checkIfUserExists(email: string) {
  //   const user = await this.userRepository.getUserDetails(email);
  //   if (!user)
  //     throw new NotFoundException('User with provided details does not exist.');
  //   return user;
  // }

  // private async checkIfPasswordsMatch(email: string, password: string) {
  //   const userPasswordInDB = await this.userRepository.getUserPassword();
  //   const passwordsMatch = await compare(password, userPasswordInDB);
  //   if (!passwordsMatch)
  //     throw new BadRequestException('Invalid details provided');
  //   return true;
  // }

  async registerWithEmailAndPassword(
    registerWithEmailAndPasswordDto: RegisterWithEmailAndPasswordDto,
  ) {
    this.eventEmitter.emitAsync(
      'user-create.email-password',
      // this triggers user creation in user table
      registerWithEmailAndPasswordDto,
    );
    // return { success: true, message: 'User registered successfully.' };
  }

  // async loginWithEmailAndPassword(
  //   loginWithEmailAndPasswordDto: LoginWithEmailAndPasswordDto,
  //   projectId: string,
  // ) {
  //   const user = await this.checkIfUserExists(
  //     loginWithEmailAndPasswordDto.email,
  //   );
  //   await this.checkIfPasswordsMatch(
  //     loginWithEmailAndPasswordDto.email,
  //     loginWithEmailAndPasswordDto.password,
  //   );
  //   const userProject = user.userProjects.find(
  //     (project) => project.projectId === projectId,
  //   );
  //   if (!userProject) {
  //     throw new NotFoundException('User does not have an account.');
  //   }
  //   const [accessToken, refreshToken] = [
  //     generateAccessToken({
  //       email: user.email,
  //       firstName: user.firstName,
  //       isVerified:
  //         user.userProjects.find((project) => project.projectId === projectId)
  //           ?.isVerified || false,
  //       lastName: user.lastName,
  //       id: user.id,
  //       role: 'user',
  //     }),
  //     await generateHashedRefreshToken(),
  //   ];
  //   return { success: true, accessToken, refreshToken };
  // }
}
