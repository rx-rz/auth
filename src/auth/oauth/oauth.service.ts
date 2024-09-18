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
import { OAuthFactory } from './oauth.factory';
import { GoogleOauthUserInfo } from './providers/google-oauth.provider';
import { GitHubOauthUserInfo } from './providers/github-oauth.provider';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';
import { LoginService } from 'src/login/login.service';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthProviderRepository: OAuthRepository,
    private readonly oauthFactory: OAuthFactory,
    private readonly projectService: ProjectService,
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
    private readonly loginService: LoginService,
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
      projectId: providerData.projectId,
    });
  }

  async addOauthProviderToProject({
    clientId,
    clientSecret,
    name,
    projectId,
    redirectUri,
  }: AddOauthProviderToProjectDto) {
    await this.projectService.checkIfProjectExists(projectId);
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

  async signIn({ code, state: id }: GetTokensDto) {
    const state = await this.oauthProviderRepository.getOauthState(id);
    if (!state) throw new NotFoundException('Oauth State not found');
    const provider = await this.getProvider(state.providerId);
    const { access_token } = await provider.getTokens(code);
    const userInfo = await provider.getUserInfo(access_token);
    const { id: userId } = await this.saveUserToDatabase(
      userInfo,
      provider.getProjectId(),
    );
    const accessToken =
      userInfo instanceof GoogleOauthUserInfo
        ? this.loginService.generateAccessToken({
            email: userInfo.email,
            id: userId,
            firstName: userInfo.family_name,
            lastName: userInfo.given_name,
            isVerified: userInfo.verified_email,
          })
        : this.loginService.generateAccessToken({
            email: userInfo.email,
            firstName: userInfo.name,
            id: userId,
            isVerified: true,
          });
    return { success: true, userInfo, accessToken };
  }

  async saveUserToDatabase(user: any, projectId: string) {
    let id: string | undefined;
    if (user instanceof GoogleOauthUserInfo) {
      const { userId } = await this.userService.createAndAssignUserToProject({
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
        authMethod: 'GOOGLE_OAUTH',
        projectId,
        isVerified: user.verified_email,
      });
      id = userId;
    } else if (user instanceof GitHubOauthUserInfo) {
      const { userId } = await this.userService.createAndAssignUserToProject({
        email: user.email,
        firstName: user.name,
        projectId,
        isVerified: true,
        authMethod: 'GITHUB_OAUTH',
      });
      id = userId;
    }
    return { id };
  }
}
