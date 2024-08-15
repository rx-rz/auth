import { Global, Module } from '@nestjs/common';
import { ProjectRepository } from 'src/project/project.repository';
import { OAuthStrategyFactory } from './oauth-strategy.factory';

@Global()
@Module({
  providers: [OAuthStrategyFactory],
  exports: [OAuthStrategyFactory, ProjectRepository],
})
export class OAuthStrategyModule {}
