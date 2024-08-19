import { z } from 'zod';

export const CreateMagicLinkSchema = z.object({
  userEmail: z.string(),
  projectId: z.string(),
  referralLink: z.string(),
});

export type CreateMagicLinkDto = z.infer<typeof CreateMagicLinkSchema>;

export const TokenSchema = z.object({
  token: z.string(),
});

export type TokenDto = z.infer<typeof TokenSchema>;
