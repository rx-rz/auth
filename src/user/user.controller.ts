import { Controller, Get, Body, Put, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { USER_ROUTES } from 'src/utils/constants/routes';
import {
  EmailDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UserIdDto,
  UserIDProjectIDDto,
} from './schema';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';
@Controller(USER_ROUTES.BASE)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post(USER_ROUTES.CREATE)
  // async createUser(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createUser(createUserDto);
  // }

  @VerifyProject()
  @Get(USER_ROUTES.GET_DETAILS)
  async getUserDetails(@Query() query: UserIdDto) {
    return this.userService.getUserDetails(query);
  }

  @VerifyProject()
  @Get(USER_ROUTES.GET_USER_PROJECT_DETAILS)
  async getUserProjectDetails(@Body() body: UserIDProjectIDDto) {
    return this.userService.getUserProjectDetails(body);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_USER_PROJECT_DETAILS)
  async updateUser(@Body() body: UpdateUserDto) {
    return this.userService.updateUser(body);
  }

  @VerifyProject()
  @Delete(USER_ROUTES.DELETE)
  async deleteUser(@Query() query: EmailDto) {
    return this.userService.deleteUser(query);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_PASSWORD)
  async updateUserPassword(@Body() body: UpdateUserPasswordDto) {
    return this.userService.updateUserPassword(body);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_EMAIL)
  async updateUserEmail(@Body() body: UpdateUserEmailDto) {
    return this.userService.updateUserEmail(body);
  }
}
