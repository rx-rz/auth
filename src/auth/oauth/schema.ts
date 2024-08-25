import { z } from 'zod';

export const AddOauthProviderToProjectSchema = z.object({
  name: z.enum(['GOOGLE', 'GITHUB']),
  clientId: z.string(),
  clientSecret: z.string(),
  projectId: z.string(),
});

export type AddOauthProviderToProjectDto = z.infer<typeof AddOauthProviderToProjectSchema>;

export const GetOAuthRegistrationLinkSchema = z.object({
  name: z.enum(['GOOGLE', 'GITHUB']),
  projectId: z.string(),
});

export type GetOAuthRegistrationLinkDto = z.infer<typeof GetOAuthRegistrationLinkSchema>;

export const GetTokensSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export type GetTokensDto = z.infer<typeof GetTokensSchema>;
