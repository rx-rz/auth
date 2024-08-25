import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

const updateAdminEmailOptions: ApiOperationOptions = {
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            currentEmail: {
              type: 'string',
              description: 'Current email of the admin',
              example: 'john.doe@example.com',
            },
            newEmail: {
              type: 'string',
              description: 'New email of the admin',
              example: 'john.doe.new@example.com',
            },
            password: {
              type: 'string',
              description: 'Password of the admin',
              example: 'password123',
            },
          },
          required: ['currentEmail', 'newEmail', 'password'],
        },
      },
    },
  },
};

const updateAdminEmailSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin email updated successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the update was successful',
            example: true,
          },
          admin: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the admin',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
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
                example: 'john.doe.new@example.com',
              },
              isVerified: {
                type: 'boolean',
                description: 'Whether the admin is verified',
                example: true,
              },
              mfaEnabled: {
                type: 'boolean',
                description: 'Whether the admin has MFA enabled',
                example: true,
              },
            },
          },
        },
      },
    },
  },
};

const updateAdminEmailConflictResponse: ApiResponseOptions = {
  status: 409,
  description: 'An email with the provided new email already exists. Please choose another.',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'An email with the provided new email already exists. Please choose another.',
          },
        },
      },
    },
  },
};

const updateAdminEmailBadRequestResponse: ApiResponseOptions = {
  status: 400,
  description: 'Invalid details provided',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid details provided.',
          },
        },
      },
    },
  },
};

const updateAdminEmailNotFoundResponse: ApiResponseOptions = {
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
            example: 'Admin not found.',
          },
        },
      },
    },
  },
};

export const openApiUpdateAdminEmailOpts = {
  options: updateAdminEmailOptions,
  successResponse: updateAdminEmailSuccessResponse,
  conflictResponse: updateAdminEmailConflictResponse,
  badRequestResponse: updateAdminEmailBadRequestResponse,
  notFoundResponse: updateAdminEmailNotFoundResponse,
};
