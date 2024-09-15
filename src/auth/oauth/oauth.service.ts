import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OAuthRepository } from './oauth.repository';
import {
  AddOauthProviderToProjectDto,
  GetOAuthRegistrationLinkDto,
  GetTokensDto,
} from './schema';
import { EncryptionService } from 'src/infra/encryption/encryption.service';
import { ProjectRepository } from 'src/project/project.repository';
import { OAuthFactory } from './oauth.factory';
import { AppEventEmitter } from 'src/infra/emitter/app-event-emitter';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthProviderRepository: OAuthRepository,
    private readonly oauthFactory: OAuthFactory,
    private readonly encryptionService: EncryptionService,
    private readonly projectRepository: ProjectRepository,
    private readonly emitter: AppEventEmitter,
  ) {}

  async getProvider(providerId: string) {
    const providerData =
      await this.oauthProviderRepository.getOauthProvider(providerId);
    if (!providerData) throw new NotFoundException('Provider not found');
    return this.oauthFactory.createProvider({
      ...providerData,
      clientId: this.encryptionService.decrypt(providerData.clientId),
      clientSecret: this.encryptionService.decrypt(providerData.clientSecret),
      redirectUri: this.encryptionService.decrypt(providerData.redirectUri),
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
    redirectUri,
  }: AddOauthProviderToProjectDto) {
    await this.checkIfProjectExists(projectId);
    const existingProvider =
      await this.oauthProviderRepository.getOauthProviderForSpecificProject(
        name,
        projectId,
      );
    if (existingProvider) {
      throw new ConflictException(
        'Provider already exists with the provided name',
      );
    }
    const oauthProvider =
      await this.oauthProviderRepository.addOauthProviderToProject({
        clientId: this.encryptionService.encrypt(clientId),
        clientSecret: this.encryptionService.encrypt(clientSecret),
        redirectUri: this.encryptionService.encrypt(redirectUri),
        project: {
          connect: {
            id: projectId,
          },
        },
        name,
      });
    return { success: true, oauthProvider };
  }

  async getOAuthRegistrationLink({
    name,
    projectId,
  }: GetOAuthRegistrationLinkDto) {
    const requiredProvider =
      await this.oauthProviderRepository.getOauthProviderForSpecificProject(
        name,
        projectId,
      );
    const provider = await this.getProvider(requiredProvider?.id ?? '');
    const state = await this.oauthProviderRepository.createOauthState({
      providerId: provider.getProviderId(),
      providerName: name,
    });
    const url = provider.getAuthorizationUrl(state.id);
    return { success: true, url };
  }

  async getOauthCallback({ code, state: id }: GetTokensDto) {
    const state = await this.oauthProviderRepository.getOauthState(id);
    if (!state) throw new NotFoundException('Oauth State not found');
    const provider = await this.getProvider(state.providerId);
    const { access_token } = await provider.getTokens(code);
    const userInfo = await provider.getUserInfo(access_token);
    return { success: true, userInfo };
  }

  async saveUserToDatabase(user: GoogleOauthUserInfo, projectId: string) {
    await this.emitter.emit('user-create.email-password', {
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      projectId,
      isVerified: user.verified_email,
      authMethod: 'GOOGLE_OAUTH',
    });
  }
}

type GoogleOauthUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
};
