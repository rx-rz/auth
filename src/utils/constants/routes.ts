export const ADMIN_ROUTES = {
  BASE: 'admin',
  REGISTER: 'register',
  UPDATE_DETAILS: 'update-details',
  UPDATE_ADMIN_EMAIL: 'update-email',
  UPDATE_ADMIN_PASSWORD: 'update-password',
  DELETE_ACCOUNT: 'delete',
  LOGIN: 'login',
  GET_PROJECTS: 'get-projects',
  GET_PROJECT_BY_NAME: 'get-project-by-name',
};

export const MFA_ROUTES = {
  BASE: 'mfa',
  GET_REGISTRATION_OPTIONS: 'get-registration-options',
  VERIFY_REGISTRATION_OPTIONS: 'verify-registration-options',
  GET_AUTHENTICATION_OPTIONS: 'get-authentication-options',
  VERIFY_AUTHENTICATION_OPTIONS: 'verify-authentication-options',
};

export const OTP_ROUTES = {
  BASE: 'otp',
  SEND: 'send-otp',
  VERIFY: 'verify-otp',
  VERIFY_ADMIN_OTP: 'verify-admin-otp',
};

export const PROJECT_ROUTES = {
  BASE: 'project',
  CREATE: 'create-project',
  UPDATE_PROJECT_NAME: 'update-project-name',
  GET_KEYS: 'get-keys',
  GET_PROJECT: 'get-project',
  GET_MAGIC_LINKS: 'get-magic-links',
  GET_REFRESH_TOKENS: 'get-refresh-tokens',
  GET_ALL_BY_ADMIN: 'get-all-by-admin',
  DELETE: 'delete',
  ADD_USER_TO_PROJECT: 'add-user-to-project',
  REMOVE_USER_FROM_PROJECT: 'remove-user-from-project',
  ASSIGN_USER_PROJECT_ROLE: 'assign-user-project-role',
};

export const USER_ROUTES = {
  BASE: 'user',
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
  GET_ROLE: 'get-details',
  UPDATE_ROLE_NAME: 'update-role-name',
  DELETE_ROLE: 'delete',
};

export const PERMISSION_ROUTES = {
  BASE: 'permission',
  CREATE_PERMISSION: 'create-permission',
  ASSIGN_TO_ROLE: 'assign-to-role',
  GET_DETAILS: 'get-details',
  UPDATE_PERMISSION: 'update-permission',
  DELETE_PERMISSION: 'delete',
};

type RouteObject =
  | typeof ADMIN_ROUTES
  | typeof OTP_ROUTES
  | typeof PROJECT_ROUTES
  | typeof USER_ROUTES
  | typeof ROLE_ROUTES;
