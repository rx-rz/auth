import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z
    .string({ required_error: 'Role name is required' })
    .max(255, 'Role name cannot be longer than 255 characters'),
  projectId: z.string({ required_error: 'Project ID is required' }),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

export const RoleIDSchema = z.object({
  roleId: z.string({ required_error: 'Role ID is required' }),
});

export type RoleIdDto = z.infer<typeof RoleIDSchema>;

export const UpdateRoleNameSchema = z.object({
  newName: z
    .string({ required_error: 'Role name is required' })
    .max(255, 'Role name cannot be longer than 255 characters'),
  roleId: z.string({ required_error: 'Role ID is required' }),
});

export type UpdateRoleNameDto = z.infer<typeof UpdateRoleNameSchema>