import { z } from 'zod';

export const CreateOtpSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .max(255, { message: 'Email length cannot be more than 255 characters' }),
    isAdmin: z.boolean().optional(),
  })
  .required();

export type CreateOtpDto = z.infer<typeof CreateOtpSchema>;

export const VerifyOtpSchema = z
  .object({
    code: z
      .string()
      .length(6, { message: 'Code must be exactly 6 characters long' }),
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .max(255, { message: 'Email length cannot be more than 255 characters' }),
    userId: z
      .string()
      .min(10, { message: 'User ID must be at least 10 characters long' })
      .max(50, { message: 'User ID cannot exceed 50 characters' }),
    projectId: z
      .string()
      .min(10, { message: 'Project ID must be at least 10 characters long' })
      .max(50, { message: 'Project ID cannot exceed 50 characters' }),
  })
  .required();

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const VerifyAdminOtpSchema = z
  .object({
    code: z
      .string()
      .length(6, { message: 'Code must be exactly 6 characters long' }),
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .max(255, { message: 'Email length cannot be more than 255 characters' }),
  })
  .required();

export type VerifyAdminOtpDto = z.infer<typeof VerifyAdminOtpSchema>;