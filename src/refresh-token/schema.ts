import { z } from 'zod';

export const StoreRefreshTokenSchema = z
  .object({
    token: z.string().min(1, { message: 'Token is required' }),
    expiresAt: z.date().min(new Date(), { message: 'Expiration date must be in the future' }),
    adminId: z.string().optional(),
    userId: z.string().optional(),
    authMethod: z.enum(
      ['GOOGLE_OAUTH', 'GITHUB_OAUTH', 'FACEBOOK_OAUTH', 'EMAIL_AND_PASSWORD_SIGNIN', 'MAGICLINK'],
      {
        message: 'Invalid authentication method',
      },
    ),
  })
  .refine((data) => data.adminId || data.userId, {
    message: 'Either adminId or userId must be provided',
  });

export type StoreRefreshTokenDto = z.infer<typeof StoreRefreshTokenSchema>;
