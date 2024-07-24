import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Response } from 'express';

@Injectable()
export class ErrorListenerService implements OnModuleInit {
  onModuleInit() {
    console.log('Error listener service working');
  }

  @OnEvent('error.occured')
  handleErrorEvent(payload: {
    error: any;
    context?: string;
    response?: Response;
  }) {
    const { error, context, response } = payload;
    if (response) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: string | object = 'Internal Server Error';
      if (error instanceof HttpException) {
        status = error.getStatus();
        message = error.getResponse();
      } else if (error instanceof Error) {
        message = error.message;
      }
      response.status(status).json({
        timestamp: new Date().toISOString(),
        message,
        success: false,
      });
    } else {
      console.error('No Error Occured LOOOOOL fuck u');
    }
  }
}
