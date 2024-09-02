import { z } from 'zod';

// AdminIdDto
export const AdminIdSchema = z.object({
  adminId: z.string({
    invalid_type_error: 'Admin ID must be a string',
    required_error: 'Admin ID not provided.',
  }),
});

export type AdminIdDto = z.infer<typeof AdminIdSchema>;

export const AdminEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email provided.' }),
});

export type AdminEmailDto = z.infer<typeof AdminEmailSchema>;

// GetAdminProjectDto
export const GetAdminProjectSchema = z.object({
  adminId: z.string({
    invalid_type_error: 'Admin ID must be a string',
    required_error: 'Admin ID not provided.',
  }),
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'Name not provided.',
  }),
});

export type GetAdminProjectDto = z.infer<typeof GetAdminProjectSchema>;

// LoginAdminDto
export const LoginAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
      required_error: 'Password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
  //   message:
  //     'Password must contain at least one letter, one number, and one special character',
  // }),
});

export type LoginAdminDto = z.infer<typeof LoginAdminSchema>;

// RegisterAdminDTO
export const RegisterAdminSchema = z.object({
  email: z.string().email().max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
      required_error: 'Password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
  //   message:
  //     'Password must contain at least one letter, one number, and one special character',
  // }),

  firstName: z
    .string({
      invalid_type_error: 'First name must be a string',
      required_error: 'First name not provided.',
    })
    .min(1, 'First name must be at least 1 character')
    .max(255, 'First name cannot exceed 255 characters'),
  lastName: z
    .string({
      invalid_type_error: 'Last name must be a string',
      required_error: 'Last name not provided.',
    })
    .min(1, 'Last name must be at least 1 character')
    .max(255, 'Last name cannot exceed 255 characters'),
});

export type RegisterAdminDto = z.infer<typeof RegisterAdminSchema>;

// UpdateAdminDTO
export const UpdateAdminSchema = z.object({
  email: z.string().email().max(255, 'Email cannot exceed 255 characters'),
  firstName: z
    .string({
      invalid_type_error: 'First name must be a string',
      required_error: 'First name not provided.',
    })
    .max(255, 'First name cannot exceed 255 characters')
    .optional(),
  lastName: z
    .string({
      invalid_type_error: 'Last name must be a string',
      required_error: 'Last name not provided.',
    })
    .max(255, 'Last name cannot exceed 255 characters')
    .optional(),
  isVerified: z.boolean().optional(),
  mfaEnabled: z.boolean().optional(),
});

export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;

// UpdateAdminEmailDto
export const UpdateAdminEmailSchema = z.object({
  currentEmail: z
    .string({
      invalid_type_error: 'Current email must be a string',
      required_error: 'Current email not provided.',
    })
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  newEmail: z
    .string({
      invalid_type_error: 'New email must be a string',
      required_error: 'New email not provided.',
    })
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
      required_error: 'Password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
  //   message:
  //     'Password must contain at least one letter, one number, and one special character',
  // }),
});

export type UpdateAdminEmailDto = z.infer<typeof UpdateAdminEmailSchema>;

// UpdateAdminPasswordDto
export const UpdateAdminPasswordSchema = z.object({
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
      required_error: 'Email not provided.',
    })
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  currentPassword: z
    .string({
      invalid_type_error: 'Current password must be a string',
      required_error: 'Current password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
  //   message:
  //     'Password must contain at least one letter, one number, and one special character',
  // }),
  newPassword: z
    .string({
      invalid_type_error: 'New password must be a string',
      required_error: 'New password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  // .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(val), {
  //   message:
  //     'Password must contain at least one letter, one number, and one special character',
  // }),
});

export type UpdateAdminPasswordDto = z.infer<typeof UpdateAdminPasswordSchema>;

export const ResetAdminPasswordSchema = z.object({
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
      required_error: 'Email not provided.',
    })
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  newPassword: z
    .string({
      invalid_type_error: 'Current password must be a string',
      required_error: 'Current password not provided.',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

export type ResetAdminPasswordDto = z.infer<typeof ResetAdminPasswordSchema>;
