import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';
const updateAdminOptions: ApiOperationOptions = {
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
          required: ['email'],
        },
      },
    },
  },
};

const updateAdminSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin details updated successfully',
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
                example: 'john.doe@example.com',
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

const updateAdminBadRequestResponse: ApiResponseOptions = {
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

const updateAdminNotFoundResponse: ApiResponseOptions = {
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

export const openApiUpdateAdminOpts = {
  options: updateAdminOptions,
  successResponse: updateAdminSuccessResponse,
  badRequestResponse: updateAdminBadRequestResponse,
  notFoundResponse: updateAdminNotFoundResponse,
};
