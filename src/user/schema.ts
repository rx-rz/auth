import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z
    .string()
    .email()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters'),
  password: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  roleId: z.string().optional(),
  firstName: z
    .string()
    .min(6, 'First name must be at least 6 characters')
    .max(255, 'First name must be at most 255 characters')
    .optional(),
  isVerified: z.boolean().optional(),
  lastName: z
    .string()
    .min(6, 'Last name must be at least 6 characters')
    .max(255, 'Last name must be at most 255 characters')
    .optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const EmailAndUserIDSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z
    .string()
    .email()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters'),
});

export const EmailSchema = z.object({
  email: z
    .string()
    .email()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters'),
});

export const UserIDSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type EmailAndUserIDDto = z.infer<typeof EmailAndUserIDSchema>;
export type EmailDto = z.infer<typeof EmailSchema>;
export type UserIdDto = z.infer<typeof UserIDSchema>;

export const GetUserProjectDetailsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export type GetUserProjectDetailsDto = z.infer<typeof GetUserProjectDetailsSchema>;

export const UpdateUserSchema = z.object({
  firstName: z
    .string()
    .min(6, 'First name must be at least 6 characters')
    .max(255, 'First name must be at most 255 characters')
    .optional(),
  lastName: z
    .string()
    .min(6, 'Last name must be at least 6 characters')
    .max(255, 'Last name must be at most 255 characters')
    .optional(),
  isVerified: z.boolean().optional(),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const UpdateUserEmailSchema = z.object({
  currentEmail: z.string().email().min(1, 'Current Email is required'),
  newEmail: z.string().email().min(1, 'New Email is required'),
  password: z.string().min(1, 'Password is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export type UpdateUserEmailDto = z.infer<typeof UpdateUserEmailSchema>;

export const UpdateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current Password is required'),
  newPassword: z.string().min(1, 'New Password is required'),
  email: z.string().email().min(1, 'Email is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export type UpdateUserPasswordDto = z.infer<typeof UpdateUserPasswordSchema>;

export const UserIDProjectIDSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

export type UserIDProjectIDDto = z.infer<typeof UserIDProjectIDSchema>;
