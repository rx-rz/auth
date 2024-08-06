import { Controller, Query, UsePipes } from '@nestjs/common';
import { LoginService } from './login.service';
import { IdDto } from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { IdSchema } from 'src/project/schema';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @UsePipes(new ZodPipe(IdSchema))
  async deleteLoginInstance(@Query() query: IdDto) {
    return this.loginService.deleteLoginInstance(query);
  }
}
