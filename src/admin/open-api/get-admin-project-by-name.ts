import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';
const getAdminProjectByNameOptions: ApiOperationOptions = {
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            adminId: {
              type: 'string',
              description: 'ID of the admin',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: { type: 'string', description: 'Name of the project', example: 'My Project' },
          },
          required: ['adminId', 'name'],
        },
      },
    },
  },
};
const getAdminProjectByNameSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin project retrieved successfully',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the retrieval was successful',
            example: true,
          },
          adminProject: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the project',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              name: { type: 'string', description: 'Name of the project', example: 'My Project' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date and time the project was created',
                example: '2023-10-27T10:00:00.000Z',
              },
              logins: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'ID of the login',
                      example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Date and time the login was created',
                      example: '2023-10-27T10:00:00.000Z',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Date and time the login was updated',
                      example: '2023-10-27T10:00:00.000Z',
                    },
                    authMethod: {
                      type: 'string',
                      description: 'Authentication method used for the login',
                      example: 'EMAIL_AND_PASSWORD_SIGNIN',
                    },
                  },
                },
              },
              refreshTokens: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'ID of the refresh token',
                      example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    token: {
                      type: 'string',
                      description: 'Refresh token',
                      example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw',
                    },
                    expiresAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Date and time the refresh token expires',
                      example: '2023-10-27T10:00:00.000Z',
                    },
                    authMethod: {
                      type: 'string',
                      description: 'Authentication method used for the refresh token',
                      example: 'EMAIL_AND_PASSWORD_SIGNIN',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
const getAdminProjectByNameNotFoundResponse: ApiResponseOptions = {
  status: 404,
  description: 'Admin or project not found',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Admin or project not found.',
          },
        },
      },
    },
  },
};
export const openApiGetAdminProjectByNameOpts = {
  options: getAdminProjectByNameOptions,
  successResponse: getAdminProjectByNameSuccessResponse,
  notFoundResponse: getAdminProjectByNameNotFoundResponse,
};
