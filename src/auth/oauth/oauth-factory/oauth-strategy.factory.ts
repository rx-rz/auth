import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OAuthProviders } from '@prisma/client';
import { ProjectRepository } from 'src/project/project.repository';
import { decrypt } from 'src/utils/helper-functions/decrypt';
import { GoogleOauthStrategy } from '../strategies/google-oauth.strategy';

@Injectable()
export class OAuthStrategyFactory {
  constructor(private readonly projectRepository: ProjectRepository) {}
  async createStrategy(
    projectId: string,
    providerName: OAuthProviders,
    encryptionKey: string,
  ): Promise<OAuthStrategy> {
    const project = await this.projectRepository.getProject(projectId);
    if (!project) throw new NotFoundException('Project ID not provided');
    const oauthProviders = await this.projectRepository.getProjectOAuthProviders(projectId);
    const existingOAuthProvider = await oauthProviders.find(
      (provider) => providerName === provider.name,
    );
    if (!existingOAuthProvider)
      throw new NotFoundException(
        `Oauth provider ${providerName} is not associated with this project`,
      );
    const clientId = decrypt(existingOAuthProvider.clientId, Buffer.from(encryptionKey));
    const clientSecret = decrypt(existingOAuthProvider.clientSecret, Buffer.from(encryptionKey));
    switch (providerName) {
      case 'GOOGLE':
        return new GoogleOauthStrategy(clientId, clientSecret, '');
      default:
        throw new BadRequestException('Unsupported Oauth Provider');
    }
  }
}
