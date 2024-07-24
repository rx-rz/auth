import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorEmitterService } from './emit-error-service';

@Catch()
export class CentralizedExceptionFilter implements ExceptionFilter {
  constructor(private errorEmitterService: ErrorEmitterService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    console.log({ exception, host });
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    this.errorEmitterService.emitError(exception, 'error');
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    response.status(status).json({
      timestamp: new Date().toISOString(),
      message,
      success: false,
    });
  }
}
