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
  UpdateUserProjectDetailsDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UserIdDto,
} from './schema';
import { ProjectService } from 'src/project/project.service';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly projectService: ProjectService,
  ) {}

  async checkIfUserExists({ email, id }: { id?: string; email?: string }) {
    const user = id
      ? await this.userRepository.getUserById(id)
      : await this.userRepository.getUserByEmail(email ?? '');
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  async checkIfPasswordsMatch(
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
  async createUser({ email, projectId, authMethod, ...body }: CreateUserDto) {
    const existingUser = await this.userRepository.getUserByEmail(email);
    const project = await this.projectService.checkIfProjectExists(projectId);
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
      await this.projectService.manageUserProjectMembership('add', {
        addProps: {
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
        },
      });
    }
    if (!existingUser) {
      await Promise.all([
        this.userRepository.createUser(email),
        this.projectService.manageUserProjectMembership('add', {
          addProps: {
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
          },
        }),
      ]);
    }
  }

  async updateUserProjectDetails(updateUserDto: UpdateUserProjectDetailsDto) {
    const { userId, projectId, ...data } = updateUserDto;
    await this.checkIfUserExists({ id: updateUserDto.userId });
    const user = await this.userRepository.updateUserProjectDetails(
      userId,
      projectId,
      data,
    );
    return { success: true, user };
  }

  async deleteUser({ email }: EmailDto) {
    await this.checkIfUserExists({ email });
    const user = await this.userRepository.deleteUser(email);
    return { success: true, user };
  }

  async getUserDetails({ userId }: UserIdDto) {
    await this.checkIfUserExists({ id: userId });
    const user = await this.userRepository.getUserById(userId);
    return { success: true, user };
  }

  async getUserProjectDetails({
    userId,
    projectId,
    email,
  }: GetUserProjectDetailsDto) {
    await this.checkIfUserExists({ id: userId });
    const user = userId
      ? await this.userRepository.getUserProjectDetails(userId, projectId)
      : await this.userRepository.getUserProjectDetailsByEmail(
          email ?? '',
          projectId,
        );
    return { success: true, user };
  }

  async updateUserProjectPassword({
    currentPassword,
    email,
    newPassword,
    projectId,
    userId,
  }: UpdateUserPasswordDto) {
    await this.checkIfUserExists({ email });
    await this.checkIfPasswordsMatch(email, currentPassword, projectId);
    const password = await hashValue(newPassword);
    const { user } = await this.userRepository.updateUserProjectPassword(
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
    await this.checkIfUserExists({ email: currentEmail });
    await this.checkIfPasswordsMatch(currentEmail, password, projectId);
    const user = await this.userRepository.updateUserEmail(
      currentEmail,
      newEmail,
    );
    return { success: true, user };
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
}
