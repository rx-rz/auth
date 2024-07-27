import { compare } from 'bcryptjs';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { UserRepository } from './user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserPasswordDto } from './dtos/update-user-password-dto';
import { UpdateUserEmailDto } from './dtos/update-user-email-dto';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { OnEvent } from '@nestjs/event-emitter';
import { GetUserProjectDetailsDto } from './dtos/get-user-project-details-dto';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emitter: AppEventEmitter,
  ) {}

  private async checkIfUserExists(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  private async checkIfUserWithEmailExists(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  private async checkIfUserIsAssignedToProject(
    email: string,
    projectId: string,
  ) {
    const userProject = await this.userRepository.getUserProjectDetailsByEmail(
      email,
      projectId,
    );
    return userProject ? true : false;
  }

  private async checkIfPasswordsMatch(
    email: string,
    password: string,
    projectId: string,
  ) {
    const userPasswordInDB = await this.userRepository.getUserPassword(
      email,
      projectId,
    );
    if (!userPasswordInDB)
      throw new BadRequestException('Invalid details provided');
    const passwordsMatch = await compare(password, userPasswordInDB);
    if (!passwordsMatch)
      throw new BadRequestException('Invalid details provided');
    return true;
  }

  @OnEvent('user-create.email-password')
  @CatchEmitterErrors()
  async createUser({
    email,
    firstName,
    lastName,
    password,
    projectId,
  }: CreateUserDto) {
    const existingUser = await this.userRepository.getUserByEmail(email);
    const userIsAssignedToProject = await this.checkIfUserIsAssignedToProject(
      email,
      projectId,
    );
    if (existingUser && userIsAssignedToProject) {
      throw new ConflictException('User is already assigned to this project.');
    }
    let user;
    if (!existingUser) {
      user = await this.userRepository.createUser({
        email,
      });
    }
    const userId = existingUser ? existingUser.id : user?.id || '';
    const hashedPassword = await hashValue(password ?? '');
    await this.emitter.emit('user.add-to-project', {
      projectId,
      userId,
      firstName,
      lastName,
      password: hashedPassword,
    });
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const { userId, projectId, ...data } = updateUserDto;
    await this.checkIfUserExists(updateUserDto.userId);
    const user = await this.userRepository.updateUserDetails(
      userId,
      projectId,
      data,
    );
    return { success: true, user };
  }

  async deleteUser(email: string) {
    await this.checkIfUserWithEmailExists(email);
    const user = await this.userRepository.deleteUser(email);
    return { success: true, user };
  }

  async getUserDetails(userId: string) {
    await this.checkIfUserExists(userId);
    const user = await this.userRepository.getUserById(userId);
    return { success: true, user };
  }

  async getUserProjectDetails({ userId, projectId }: GetUserProjectDetailsDto) {
    await this.checkIfUserExists(userId);
    const user = await this.userRepository.getUserProjectDetails(
      userId,
      projectId,
    );
    return { success: true, user };
  }

  async updateUserPassword({
    currentPassword,
    email,
    newPassword,
    projectId,
    userId,
  }: UpdateUserPasswordDto) {
    await this.checkIfUserWithEmailExists(email);
    await this.checkIfPasswordsMatch(email, currentPassword, projectId);
    const user = await this.userRepository.updateUserPassword(
      userId,
      projectId,
      await hashValue(newPassword),
    );
    return { success: true, user };
  }

  async updateUserEmail({
    currentEmail,
    newEmail,
    password,
    projectId,
  }: UpdateUserEmailDto) {
    await this.checkIfUserWithEmailExists(currentEmail);
    await this.checkIfPasswordsMatch(currentEmail, password, projectId);
    const user = await this.userRepository.updateUserEmail(
      currentEmail,
      newEmail,
    );
    return { success: true, user };
  }
}
