import { compare } from 'bcryptjs';
import { UserRepository } from './user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hashValue } from 'src/utils/helper-functions/hash-value';
import { OnEvent } from '@nestjs/event-emitter';
import { CatchEmitterErrors } from 'src/utils/decorators/catch-emitter-errors.decorator';
import {
  CreateUserDto,
  EmailDto,
  GetUserProjectDetailsDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UserIdDto,
} from './schema';
import { ProjectRepository } from 'src/project/project.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly projectRepository: ProjectRepository,
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
    const userPasswordInDB = await this.userRepository.getUserPasswordByEmail(
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
  async createUser({ email, projectId, authMethod, ...body }: CreateUserDto) {
    const existingUser = await this.userRepository.getUserByEmail(email);
    const project = await this.projectRepository.getProject(projectId);
    if (!project)
      throw new NotFoundException('Project with provided ID does not exist');

    const userIsAssignedToProject = await this.checkIfUserIsAssignedToProject(
      email,
      projectId,
    );
    if (existingUser && userIsAssignedToProject) {
      if (authMethod !== 'GOOGLE_OAUTH') {
        throw new ConflictException(
          'User is already assigned to this project.',
        );
      }
    }
    if (existingUser && !userIsAssignedToProject) {
      await this.projectRepository.addUserToProject({
        project: {
          connect: {
            id: projectId,
          },
        },
        user: {
          connect: {
            email,
          },
        },
        ...body,
      });
    }
    if (!existingUser) {
      await Promise.all([
        this.userRepository.createUser(email),
        this.projectRepository.addUserToProject({
          project: {
            connect: {
              id: projectId,
            },
          },
          user: {
            connect: {
              email,
            },
          },
          ...body,
        }),
      ]);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const { userId, projectId, ...data } = updateUserDto;
    await this.checkIfUserExists(updateUserDto.userId);
    const user = await this.userRepository.updateUserProjectDetails(
      userId,
      projectId,
      data,
    );
    return { success: true, user };
  }

  async deleteUser({ email }: EmailDto) {
    await this.checkIfUserWithEmailExists(email);
    const user = await this.userRepository.deleteUser(email);
    return { success: true, user };
  }

  async getUserDetails({ userId }: UserIdDto) {
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

  //TODO: update user password doesn't update??
  async updateUserPassword({
    currentPassword,
    email,
    newPassword,
    projectId,
    userId,
  }: UpdateUserPasswordDto) {
    await this.checkIfUserWithEmailExists(email);
    await this.checkIfPasswordsMatch(email, currentPassword, projectId);
    const password = await hashValue(newPassword);
    const { user } = await this.userRepository.updateUserPassword(
      userId,
      projectId,
      password,
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
