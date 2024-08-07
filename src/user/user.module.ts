import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { ProjectRepository } from 'src/project/project.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, ProjectRepository],
})
export class UserModule {}
