import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';

export function OpenApiEndpoint(values: {
  options: ApiOperationOptions;
  responses: ApiResponseOptions[];
}) {
  const responseDecorators = values.responses.map(({ content, description, status }) => {
    return ApiResponse({
      status,
      content,
      description,
    });
  });

  return applyDecorators(ApiOperation({ ...values.options }), ...responseDecorators);
}
