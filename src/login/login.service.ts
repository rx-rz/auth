import { Injectable, NotFoundException, UsePipes } from '@nestjs/common';
import { LoginRepository } from './login.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateLoginInstanceDto, CreateLoginInstanceSchema, IdDto } from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';
import { IdSchema } from 'src/project/schema';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}

  private async checkIfLoginInstanceExists(id: string) {
    const login = await this.loginRepository.getLoginInstance(id);
    if (!login) throw new NotFoundException('Login instance not found');
  }

  @OnEvent('login.create-login-instance')
  @UsePipes(new ZodPipe(CreateLoginInstanceSchema))
  async createLoginInstance(body: CreateLoginInstanceDto) {
    const login = await this.loginRepository.createLoginInstance(body);
    return { success: true, login };
  }

  @UsePipes(new ZodPipe(IdSchema))
  async deleteLoginInstance({ id }: IdDto) {
    await this.checkIfLoginInstanceExists(id);
    const login = this.loginRepository.deleteLoginInstance(id);
    return { success: true, login };
  }
}
