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

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private async checkIfUserExists(email: string) {
    const user = await this.userRepository.getUserDetails(email);
    if (!user)
      throw new NotFoundException('User with provided details does not exist.');
    return user;
  }

  private async checkIfPasswordsMatch(email: string, password: string) {
    const userPasswordInDB = await this.userRepository.getUserPassword(email);
    const passwordsMatch = await compare(password, userPasswordInDB);
    if (!passwordsMatch)
      throw new BadRequestException('Invalid details provided');
    return true;
  }

  async createUser(createUserDto: CreateUserDto) {
    const userExists = await this.userRepository.getUserDetails(
      createUserDto.email,
    );
    if (userExists)
      throw new ConflictException('User with provided email already exists.');
    const user = await this.userRepository.createUser(createUserDto);
    return { success: true, user };
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const { email, ...data } = updateUserDto;
    this.checkIfUserExists(email);
    const user = await this.userRepository.updateUser(email, data);
    return { success: true, user };
  }

  async deleteUser(email: string) {
    this.checkIfUserExists(email);
    const user = await this.userRepository.deleteUser(email);
    return { success: true, user };
  }

  async getUserDetails(email: string) {
    this.checkIfUserExists(email);
    const user = await this.userRepository.getUserDetails(email);
    return { success: true, user };
  }

  async updateUserPassword(updatePasswordDto: UpdateUserPasswordDto) {
    this.checkIfUserExists(updatePasswordDto.email);
    this.checkIfPasswordsMatch(
      updatePasswordDto.email,
      updatePasswordDto.currentPassword,
    );
    const user = await this.userRepository.updateUserPassword(
      updatePasswordDto.email,
      updatePasswordDto.newPassword,
    );
    return { success: true, user };
  }

  async updateUserEmail(updateEmailDto: UpdateUserEmailDto) {
    this.checkIfUserExists(updateEmailDto.currentEmail);
    this.checkIfPasswordsMatch(
      updateEmailDto.currentEmail,
      updateEmailDto.password,
    );
    const user = await this.userRepository.updateUserEmail(
      updateEmailDto.currentEmail,
      updateEmailDto.newEmail,
    );
    return { success: true, user };
  }
}
