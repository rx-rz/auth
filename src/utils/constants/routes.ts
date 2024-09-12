export const ADMIN_ROUTES = {
  BASE: 'admins',
  REGISTER: 'register-admin',
  UPDATE_ADMIN_DETAILS: 'update-admin-details',
  UPDATE_ADMIN_EMAIL: 'update-admin-email',
  UPDATE_ADMIN_PASSWORD: 'update-admin-password',
  DELETE_ACCOUNT: 'delete-admin',
  LOGIN: 'login-admin',
  LOGOUT: 'logout-admin',
  GET_PROJECTS: 'get-admin-projects',
  RESET_PASSWORD: 'reset-admin-password',
  GET_PROJECT_BY_NAME: 'get-admin-project-by-name',
};

export const MFA_ROUTES = {
  BASE: 'mfa',
  GET_REGISTRATION_OPTIONS: 'get-registration-options',
  VERIFY_REGISTRATION_OPTIONS: 'verify-registration-options',
  GET_AUTHENTICATION_OPTIONS: 'get-authentication-options',
  VERIFY_AUTHENTICATION_OPTIONS: 'verify-authentication-options',
};

export const OTP_ROUTES = {
  BASE: 'otps',
  SEND: 'send-otp',
  VERIFY: 'verify-otp',
  VERIFY_ADMIN_OTP: 'verify-admin-otp',
};

export const PROJECT_ROUTES = {
  BASE: 'projects',
  CREATE: 'create-project',
  UPDATE_PROJECT_NAME: 'update-project-name',
  UPDATE_PROJECT_SETTINGS: 'update-project-settings',
  GET_KEYS: 'get-keys',
  GET_PROJECT: 'get-project',
  ASSIGN_USER_PROJECT_ROLE: 'assign-user-project-role',
  REMOVE_USER_FROM_PROJECT_ROLE: 'remove-user-from-project-role',
  REMOVE_USER_FROM_BLOCKLIST: 'remove-user-from-blocklist',
  ADD_USER_TO_BLOCKLIST: 'add-user-to-blocklist',
  GET_PROJECT_BLOCKLIST: 'get-project-blocklist',
  GET_PROJECT_ROLES: 'get-project-roles',
  GET_MAGIC_LINKS: 'get-magic-links',
  GET_REFRESH_TOKENS: 'get-refresh-tokens',
  GET_ADMIN_PROJECTS: 'get-admin-projects',
  DELETE: 'delete-project',
  ADD_USER_TO_PROJECT: 'add-user-to-project',
  REMOVE_USER_FROM_PROJECT: 'remove-user-from-project',
};

export const USER_ROUTES = {
  BASE: 'users',
  CREATE: 'create',
  UPDATE_USER_PROJECT_DETAILS: 'update-project-details',
  UPDATE_PASSWORD: 'update-password',
  UPDATE_EMAIL: 'update-email',
  GET_DETAILS: 'get-details',
  GET_USER_PROJECT_DETAILS: 'get-user-project-details',
  DELETE: 'delete',
  REGISTER_WITH_EMAIL_AND_PASSWORD: 'register',
  SIGNIN_WITH_EMAIL_AND_PASSWORD: 'signin',
};

export const ROLE_ROUTES = {
  BASE: 'role',
  CREATE_ROLE: 'create-role',
  GET_ROLE: 'get-role-details',
  UPDATE_ROLE_NAME: 'update-role-name',
  DELETE_ROLE: 'delete-role',
};

export const PERMISSION_ROUTES = {
  BASE: 'permission',
  CREATE_PERMISSION: 'create-permission',
  ASSIGN_TO_ROLE: 'assign-permission-to-role',
  REMOVE_FROM_ROLE: 'remove-permission-from-role',
  GET_DETAILS: 'get-details',
  GET_PROJECT_PERMISSIONS: 'get-project-permissions',
  UPDATE_PERMISSION: 'update-permission',
  DELETE_PERMISSION: 'delete-permission',
};

export const MAGIC_LINK_ROUTES = {
  BASE: 'magic-link',
  SEND_MAGIC_LINK: 'send-magic-link',
  DELETE_MAGIC_LINK: 'delete',
  VERIFY_MAGIC_LINK: 'verify',
};
