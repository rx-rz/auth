import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

const registerAdminOptions: ApiOperationOptions = {
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'First name of the admin',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Last name of the admin',
              example: 'Doe',
            },
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
          required: ['firstName', 'lastName', 'email', 'password'],
        },
      },
    },
  },
};

const registerAdminSuccessResponse: ApiResponseOptions = {
  status: 201,
  description: 'Admin registered successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the registration was successful',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Success message',
            example: 'Admin registered successfully.',
          },
        },
      },
    },
  },
};

const registerAdminConflictResponse: ApiResponseOptions = {
  status: 409,
  description: 'Admin already exists',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Admin already created.',
          },
        },
      },
    },
  },
};

export const openApiRegisterAdminOpts = {
  options: registerAdminOptions,
  successResponse: registerAdminSuccessResponse,
  conflictResponse: registerAdminConflictResponse,
};
