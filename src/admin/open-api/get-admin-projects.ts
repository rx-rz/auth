import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

const getAdminProjectsOptions: ApiOperationOptions = {
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

const getAdminProjectsSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: 'Admin projects retrieved successfully',
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
          adminProjects: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID of the project',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                name: {
                  type: 'string',
                  description: 'Name of the project',
                  example: 'My Project',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date and time the project was created',
                  example: '2023-10-27T10:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
  },
};

const getAdminProjectsNotFoundResponse: ApiResponseOptions = {
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

export const openApiGetAdminProjectsOpts = {
  options: getAdminProjectsOptions,
  successResponse: getAdminProjectsSuccessResponse,
  notFoundResponse: getAdminProjectsNotFoundResponse,
};
