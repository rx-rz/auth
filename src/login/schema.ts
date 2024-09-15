import { z } from 'zod';

export const CreateLoginInstanceSchema = z
  .object({
    userId: z.string().min(1, 'User ID should be provided'),
    projectId: z.string().min(1, 'Project ID must not be empty'),
    ipAddress: z.string().min(1, 'IP Address must not be empty'),
    attempts: z.number().int().default(1).optional(),
    userAgent: z.string().min(1, 'User Agent must not be empty'),
    authMethod: z.enum([
      'GOOGLE_OAUTH',
      'GITHUB_OAUTH',
      'FACEBOOK_OAUTH',
      'EMAIL_AND_PASSWORD_SIGNIN',
      'MAGICLINK',
    ]),
    status: z.enum(['SUCCESS', 'FAILURE']),
  })
  .required();

export type CreateLoginInstanceDto = z.infer<typeof CreateLoginInstanceSchema>;

export const LoginIdSchema = z.object({
  loginId: z.string({ required_error: 'ID is required' }),
});

export type LoginIdDto = z.infer<typeof LoginIdSchema>;
