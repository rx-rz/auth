import { z } from 'zod';

export const LoginWithEmailAndPasswordSchema = z.object({
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be string',
  }),
  email: z.string().email(),
  projectId: z.string({ required_error: 'Project ID is required' }),
});

export type LoginWithEmailAndPasswordDto = z.infer<typeof LoginWithEmailAndPasswordSchema>;

export const RegisterWithEmailAndPasswordSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  projectId: z.string(),
});

export type RegisterWithEmailAndPasswordDto = z.infer<typeof RegisterWithEmailAndPasswordSchema>;
