import { Controller, Query, UsePipes } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginIdDto, LoginIdSchema } from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @UsePipes(new ZodPipe(LoginIdSchema))
  async deleteLoginInstance(@Query() query: LoginIdDto) {
    return this.loginService.deleteLoginInstance(query);
  }
}
