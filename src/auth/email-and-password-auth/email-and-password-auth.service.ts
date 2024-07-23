import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class EmailAndPasswordAuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async registerWithEmailAndPassword() {}

  async loginWithEmailAndPassword() {}
}
