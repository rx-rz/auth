import { Injectable } from '@nestjs/common';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';
import { CreateLoginInstanceDto } from './dtos/create-login-instance-dto';
import { LoginRepository } from './login.repository';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LoginService {
  constructor(
    private readonly loginRepository: LoginRepository,
  ) {}

  @OnEvent('user.login')
  async createLoginInstance(value: CreateLoginInstanceDto) {
    return this.loginRepository.createLoginInstance(value);
  }

  async deleteLoginInstance(id: string) {
    return this.loginRepository.deleteLoginInstance(id);
  }
}
