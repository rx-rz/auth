import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

const deleteAdminOptions: ApiOperationOptions = {
  parameters: [
    {
      in: 'query',
      name: 'email',
      schema: {
        type: 'string',
        format: 'email',
        description: 'Email of the admin',
        example: 'john.doe@example.com',
      },
      required: true,
    },
  ],
};

const deleteAdminSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin deleted successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the deletion was successful',
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
                description: 'Indicates whether the admin is verified',
                example: true,
              },
              mfaEnabled: {
                type: 'boolean',
                description: 'Indicates whether the admin has MFA enabled',
                example: true,
              },
            },
          },
        },
      },
    },
  },
};

const deleteAdminNotFoundResponse: ApiResponseOptions = {
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

export const openApiDeleteAdminOpts = {
  options: deleteAdminOptions,
  successResponse: deleteAdminSuccessResponse,
  notFoundResponse: deleteAdminNotFoundResponse,
};
