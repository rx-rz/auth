import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

const loginAdminOptions: ApiOperationOptions = {
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Email of the admin',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              description: 'Password of the admin',
              example: 'password123',
            },
          },
          required: ['email', 'password'],
        },
      },
    },
  },
};

const loginAdminSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin logged in successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the login was successful',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Success message',
            example: 'Login successful',
          },
          accessToken: {
            type: 'string',
            description: 'Access token',
            example:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiaXNVZXJmaWVkIjp0cnVlLCJpZCI6IjE2Njg2NjY2NjY2NjYiLCJyb2xlIjoiYWRtaW4iLCJtZmFFbmFibGVkIjp0cnVlLCJpYXQiOjE2Njg2NjY2NjYsImV4cCI6MTY3MDI3NDY2Nlx9.4567890123456789012345678901234567890123456789012345678901234567',
          },
        },
      },
    },
  },
};

const loginAdminUnauthorizedResponse: ApiResponseOptions = {
  status: 401,
  description: 'Invalid credentials',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid credentials provided.',
          },
        },
      },
    },
  },
};

const loginAdminNotFoundResponse: ApiResponseOptions = {
  status: 404,
  description: 'Admin not found',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Admin with the provided details does not exist.',
          },
        },
      },
    },
  },
};

export const openApiLoginAdminOpts = {
  options: loginAdminOptions,
  successResponse: loginAdminSuccessResponse,
  unauthorizedResponse: loginAdminUnauthorizedResponse,
  notFoundResponse: loginAdminNotFoundResponse,
};
