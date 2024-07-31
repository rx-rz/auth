import { Injectable, UsePipes } from '@nestjs/common';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { LoginRepository } from './login.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateLoginInstanceDto, CreateLoginInstanceSchema } from './schema';
import { ZodPipe } from 'src/utils/schema-validation/validation.pipe';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}

  @OnEvent('user.login')
  @UsePipes(new ZodPipe(CreateLoginInstanceSchema))
  async createLoginInstance(value: CreateLoginInstanceDto) {
    return this.loginRepository.createLoginInstance(value);
  }

  async deleteLoginInstance(id: string) {
    return this.loginRepository.deleteLoginInstance(id);
  }
}
