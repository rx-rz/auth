import { z } from 'zod';

export const AddUserToProjectSchema = z.object({
  userId: z.string({ required_error: 'User ID should be provided' }),
  projectId: z.string({ required_error: 'Project ID should be provided' }),
  firstName: z
    .string()
    .max(255, { message: 'First name cannot be longer than 255 characters' }),
  lastName: z
    .string()
    .max(255, { message: 'Last name cannot be longer than 255 characters' }),
  password: z
    .string({
      invalid_type_error: 'Current password must be a string',
      required_error: 'Current password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
      message:
        'Password must contain at least one letter, one number, and one special character',
    }),
});

export type AddUserToProjectDto = z.infer<typeof AddUserToProjectSchema>;

export const AssignUserProjectRoleSchema = z.object({
  userId: z.string({ required_error: 'User ID should be provided' }),
  projectId: z.string({ required_error: 'Project ID should be provided' }),
  roleId: z.coerce.number({ required_error: 'Role ID should be provided' }),
});

export type AssignUserToProjectRoleDto = z.infer<
  typeof AssignUserProjectRoleSchema
>;

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .max(255, { message: 'Name cannot be longer than 255 characters' }),
  adminId: z.string({ required_error: 'Admin ID should be provided' }),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const IdSchema = z.object({
  projectId: z.string({ required_error: 'ID should be provided' }),
});

export type IdDto = z.infer<typeof IdSchema>;

export const AdminIdSchema = z.object({
  adminId: z.string({ required_error: 'ID should be provided' }),
});

export type AdminIdDto = z.infer<typeof AdminIdSchema>;

export const RemoveUserFromProjectSchema = z.object({
  userId: z.string({ required_error: 'User ID should be provided' }),
  projectId: z.string({ required_error: 'ID should be provided' }),
});

export type RemoveUserFromProjectDto = z.infer<
  typeof RemoveUserFromProjectSchema
>;

export const UpdateProjectNameSchema = z.object({
  projectId: z.string({ required_error: 'ID should be provided' }),
  name: z
    .string()
    .max(255, { message: 'Name cannot be longer than 255 characters' }),
});

export type UpdateProjectNameDto = z.infer<typeof UpdateProjectNameSchema>;

export const VerifyProjectApiKeysSchema = z.object({
  apiKey: z
    .string({ required_error: 'API key should be provided' })
    .max(64, 'Api Key cannot be longer than 64 characters'),
  clientKey: z
    .string({ required_error: 'CLIENT key should be provided' })
    .max(64, 'Client Key cannot be longer than 64 characters'),
});

export type VerifyProjectApiKeysDto = z.infer<
  typeof VerifyProjectApiKeysSchema
>;
