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
import { UserIDProjectIDDto } from './dtos/user-id-project-id-dto';
@Controller(USER_ROUTES.BASE)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post(USER_ROUTES.CREATE)
  // async createUser(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createUser(createUserDto);
  // }

  @Get(USER_ROUTES.GET_DETAILS)
  async getUserDetails(@Query('userId') userId: string) {
    return this.userService.getUserDetails(userId);
  }

  @Get(USER_ROUTES.GET_USER_PROJECT_DETAILS)
  async getUserProjectDetails(@Body() body: UserIDProjectIDDto) {
    return this.userService.getUserProjectDetails(body);
  }

  @Put(USER_ROUTES.UPDATE_USER_PROJECT_DETAILS)
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }

  @Delete(USER_ROUTES.DELETE)
  async deleteUser(@Query('email') email: string) {
    return this.userService.deleteUser(email);
  }

  @Put(USER_ROUTES.UPDATE_PASSWORD)
  async updateUserPassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.userService.updateUserPassword(updateUserPasswordDto);
  }

  @Put(USER_ROUTES.UPDATE_EMAIL)
  async updateUserEmail(@Body() updateUserEmailDto: UpdateUserEmailDto) {
    return this.userService.updateUserEmail(updateUserEmailDto);
  }
}
