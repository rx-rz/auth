import { Controller, Get, Body, Put, Delete, Query, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { USER_ROUTES } from 'src/utils/constants/routes';
import {
  EmailDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UserIdDto,
  UserIDProjectIDDto,
  UserIDSchema,
  GetUserProjectDetailsSchema,
  UpdateUserEmailSchema,
  UpdateUserPasswordSchema,
  EmailSchema,
  UpdateUserSchema,
} from './schema';
import { VerifyProject } from 'src/utils/interceptors/project-verification.interceptor';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
@Controller(USER_ROUTES.BASE)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @VerifyProject()
  @Get(USER_ROUTES.GET_DETAILS)
  @UsePipes(new ZodPipe(UserIDSchema))
  async getUserDetails(@Query() query: UserIdDto) {
    return this.userService.getUserDetails(query);
  }

  @VerifyProject()
  @Get(USER_ROUTES.GET_USER_PROJECT_DETAILS)
  @UsePipes(new ZodPipe(GetUserProjectDetailsSchema))
  async getUserProjectDetails(@Query() query: UserIDProjectIDDto) {
    return this.userService.getUserProjectDetails(query);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_USER_PROJECT_DETAILS)
  @UsePipes(new ZodPipe(UpdateUserSchema))
  async updateUser(@Body() body: UpdateUserDto) {
    return this.userService.updateUser(body);
  }

  @VerifyProject()
  @Delete(USER_ROUTES.DELETE)
  @UsePipes(new ZodPipe(EmailSchema))
  async deleteUser(@Query() query: EmailDto) {
    return this.userService.deleteUser(query);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_PASSWORD)
  @UsePipes(new ZodPipe(UpdateUserPasswordSchema))
  async updateUserPassword(@Body() body: UpdateUserPasswordDto) {
    return this.userService.updateUserPassword(body);
  }

  @VerifyProject()
  @Put(USER_ROUTES.UPDATE_EMAIL)
  @UsePipes(new ZodPipe(UpdateUserEmailSchema))
  async updateUserEmail(@Body() body: UpdateUserEmailDto) {
    return this.userService.updateUserEmail(body);
  }
}
