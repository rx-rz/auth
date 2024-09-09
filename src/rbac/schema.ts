import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z
    .string({ required_error: 'Role name is required' })
    .max(50, 'Role name cannot be longer than 255 characters'),
  projectId: z.string({ required_error: 'Project ID is required' }),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

export const RoleIDSchema = z.object({
  roleId: z.string({ required_error: 'Role ID is required' }),
});

export type RoleIdDto = z.infer<typeof RoleIDSchema>;

export const UpdateRoleNameSchema = z.object({
  name: z
    .string({ required_error: 'Role name is required' })
    .max(50, 'Role name cannot be longer than 255 characters'),
  roleId: z.string({ required_error: 'Role ID is required' }),
});

export type UpdateRoleNameDto = z.infer<typeof UpdateRoleNameSchema>;

export const CreatePermissionSchema = z.object({
  name: z.string({ required_error: 'Permission name is required' }).max(200, {
    message: 'Permission name cannot be longer than 200 characters',
  }),
  description: z.string().optional(),
  projectId: z.string({ required_error: 'Project ID is required' }),
});

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;

export const AssignPermissionToRoleSchema = z.object({
  permissionId: z.string({ required_error: 'Permission ID is required' }),
  roleId: z.string({ required_error: 'Role ID is required' }),
});
export const RemovePermissionFromRoleSchema = AssignPermissionToRoleSchema;
export type AssignPermissionToRoleDto = z.infer<typeof AssignPermissionToRoleSchema>;
export type RemovePermissionFromRoleDto = AssignPermissionToRoleDto;
export const PermissionIdSchema = z.object({
  permissionId: z.string({ required_error: 'Permission ID is required' }),
});
export type PermissionIdDto = z.infer<typeof PermissionIdSchema>;

export const UpdatePermissionSchema = z.object({
  permissionId: z.string({ required_error: 'Permission ID is required!' }),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdatePermissionDto = z.infer<typeof UpdatePermissionSchema>;
