import { z } from 'zod';

export const EmailSchema = z.object({
  email: z
    .string({ required_error: 'Email required' })
    .email({ message: 'Invalid email provided' }),
});

export type EmailDto = z.infer<typeof EmailSchema>;
