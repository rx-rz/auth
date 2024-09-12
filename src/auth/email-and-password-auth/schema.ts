import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export type PasswordSettings = {
  passwordMinLength: number;
  passwordRequireLowercase: boolean;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
};

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
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email provided' }),
  password: z.string(),
  projectId: z.string(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export const validateNames = (firstName: string, lastName: string) => {
  const NamesSchema = z.object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(2, { message: 'First name should be at least 2 characters long' })
      .max(100),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(2, { message: 'Last name should be at least 2 characters long' })
      .max(100),
  });

  const { error } = NamesSchema.safeParse({ firstName, lastName });
  if (error) throw new BadRequestException(error.errors.map((err) => err.message).join(', '));
};
export const validatePassword = (
  password: string,
  {
    passwordMinLength,
    passwordRequireLowercase,
    passwordRequireNumbers,
    passwordRequireSpecialChars,
    passwordRequireUppercase,
  }: Partial<PasswordSettings>,
) => {
  const PasswordVerificationSchema = z.object({
    password: z
      .string()
      .min(
        passwordMinLength ?? 8,
        `Password must not be less than ${passwordMinLength ?? 8} characters`,
      )
      .refine(
        (password) => {
          if (passwordRequireLowercase) {
            return /[a-z]/.test(password);
          }
          return true;
        },
        { message: 'Password must contain at least one lowercase character' },
      )
      .refine(
        (password) => {
          if (passwordRequireUppercase) {
            return /[A-Z]/.test(password);
          }
          return true;
        },
        { message: 'Password must contain at least one uppercase character' },
      )
      .refine(
        (password) => {
          if (passwordRequireNumbers) {
            return /\d/.test(password);
          }
          return true;
        },
        { message: 'Password must contain at least one number' },
      )
      .refine(
        (password) => {
          if (passwordRequireSpecialChars) {
            return /[!@#$%^&*(),.?":{}|<>]/.test(password);
          }
          return true;
        },
        { message: 'Password must contain at least one special character' },
      ),
  });
  const { error } = PasswordVerificationSchema.safeParse({ password });
  if (error) {
    throw new BadRequestException(error.errors.map((err) => err.message).join(', '));
  }
};

export type RegisterWithEmailAndPasswordDto = z.infer<typeof RegisterWithEmailAndPasswordSchema>;
