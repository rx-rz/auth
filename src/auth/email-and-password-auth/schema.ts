import { z } from 'zod';

export const LoginWithEmailAndPasswordDtoSchema = z.object({
  password: z.string(),
  email: z.string().email(),
  projectId: z.string(),
});

export type LoginWithEmailAndPasswordDto = z.infer<typeof LoginWithEmailAndPasswordDtoSchema>;

export const RegisterWithEmailAndPasswordDtoSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  projectId: z.string(),
});

export type RegisterWithEmailAndPasswordDto = z.infer<typeof RegisterWithEmailAndPasswordDtoSchema>;
