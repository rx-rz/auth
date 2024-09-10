import { z } from 'zod';

export const CreateLoginInstanceSchema = z
  .object({
    email: z.string().email('User Email must not be empty').optional(),
    username: z.string().optional(),
    projectId: z.string().min(1, 'Project ID must not be empty'),
    ipAddress: z.string().min(1, 'IP Address must not be empty'),
    userAgent: z.string().min(1, 'User Agent must not be empty'),
    authMethod: z.enum([
      'GOOGLE_OAUTH',
      'GITHUB_OAUTH',
      'FACEBOOK_OAUTH',
      'EMAIL_AND_PASSWORD_SIGNIN',
      'USERNAME_AND_PASSWORD_SIGNIN',
      'MAGICLINK',
    ]),
    status: z.enum(['SUCCESS', 'FAILURE']),
  })
  .required();

export type CreateLoginInstanceDto = z.infer<typeof CreateLoginInstanceSchema>;

export const IDSchema = z.object({
  id: z.string({ required_error: 'ID is required' }),
});

export type IdDto = z.infer<typeof IDSchema>;
