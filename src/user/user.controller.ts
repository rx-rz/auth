import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password-dto';
import { UpdateUserEmailDto } from './dtos/update-user-email-dto';
import { USER_ROUTES } from 'src/utils/constants/routes';

@Controller(USER_ROUTES.BASE)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(USER_ROUTES.CREATE)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(USER_ROUTES.GET_DETAILS)
  async getUserDetails(@Query('email') email: string) {
    return this.userService.getUserDetails(email);
  }

  @Put(USER_ROUTES.UPDATE)
  async updateUser(
    @Query('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(updateUserDto);
  }

  @Delete(USER_ROUTES.DELETE)
  async deleteUser(@Query('email') email: string) {
    return this.userService.deleteUser(email);
  }

  @Put(USER_ROUTES.UPDATE_PASSWORD)
  async updateUserPassword(
    @Query('email') email: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.userService.updateUserPassword(updateUserPasswordDto);
  }

  @Put(USER_ROUTES.UPDATE_EMAIL)
  async updateUserEmail(
    @Query('email') email: string,
    @Body() updateUserEmailDto: UpdateUserEmailDto,
  ) {
    return this.userService.updateUserEmail(updateUserEmailDto);
  }
}
