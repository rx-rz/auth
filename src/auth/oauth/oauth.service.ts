import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuthRepository } from './oauth.repository';
import { AddOauthProviderToProjectDto, GetOAuthRegistrationLinkDto, GetTokensDto } from './schema';
import { EncryptionService } from 'src/infra/encryption/encryption.service';
import { ProjectService } from 'src/project/project.service';
import { ProjectRepository } from 'src/project/project.repository';
import { OAuthFactory } from './oauth.factory';
import { OAuthProviders } from '@prisma/client';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthProviderRepository: OAuthRepository,
    private readonly oauthFactory: OAuthFactory,
    private readonly encryptionService: EncryptionService,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async getProvider(projectId: string, providerName: OAuthProviders) {
    const providerData = await this.oauthProviderRepository.getOauthProviderForProject(
      providerName,
      projectId,
    );
    if (!providerData) throw new NotFoundException('Provider not found');
    return this.oauthFactory.createProvider({
      ...providerData,
      clientId: this.encryptionService.decrypt(providerData.clientId),
      clientSecret: this.encryptionService.decrypt(providerData.clientSecret),
    });
  }

  async checkIfProjectExists(projectId: string) {
    const project = await this.projectRepository.getProject(projectId);
    if (!project) throw new NotFoundException('Project not found.');
  }

  async addOauthProviderToProject({
    clientId,
    clientSecret,
    name,
    projectId,
  }: AddOauthProviderToProjectDto) {
    await this.checkIfProjectExists(projectId);
    const oauthProvider = await this.oauthProviderRepository.addOauthProviderToProject({
      clientId: this.encryptionService.encrypt(clientId),
      clientSecret: this.encryptionService.encrypt(clientSecret),
      project: {
        connect: {
          id: projectId,
        },
      },
      name,
    });
    return { success: true, oauthProvider };
  }

  async getOAuthRegistrationLink({ name, projectId }: GetOAuthRegistrationLinkDto) {
    const provider = await this.getProvider(projectId, name);
    const state = await this.oauthProviderRepository.createOauthState({
      providerId: provider.getID(),
      providerName: name,
    });
    const url = provider.getAuthorizationUrl(state.id);
    return { success: true, url };
  }

  async getOauthCallback({ code, state: id }: GetTokensDto) {
    const state = await this.oauthProviderRepository.getOauthState(id);
    if (!state) throw new NotFoundException('Oauth State not found');
    const provider = await this.getProvider(state.providerId, state.providerName);
    const { accessToken } = await provider.getTokens(code);
    const userInfo = await provider.getUserInfo(accessToken);
  }
}
