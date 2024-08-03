import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CentralizedExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      console.log(exception);
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      console.log(exception);
      message = exception.message;
    }
    response.status(status).json({
      timestamp: new Date().toISOString(),
      message,
      success: false,
    });
  }
}
