export const ADMIN_ROUTES = {
  BASE: 'admin',
  REGISTER: 'register',
  UPDATE_DETAILS: 'update-details',
  LOGIN: 'login',
  GET_PROJECTS: 'get-projects',
};

export const OTP_ROUTES = {
  BASE: 'otp',
  SEND: 'send-otp',
  VERIFY: 'verify-otp',
};

export const PROJECT_ROUTES = {
  BASE: 'project',
  CREATE: 'create',
  UPDATE_PROJECT_NAME: 'update-project-name',
  UPDATE_API_KEY: 'update-api-key',
  GET_API_KEY: 'get-api-key',
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
  UPDATE: 'update',
  UPDATE_PASSWORD: 'update-password',
  UPDATE_EMAIL: 'update-email',
  GET_DETAILS: 'get-details',
  DELETE: 'delete',
};
