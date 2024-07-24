import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';

@Injectable()
export class ErrorEmitterService implements OnModuleInit {
  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    process.on('uncaughtException', (error) => {
      this.emitError(error, 'uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      this.emitError(reason, 'UnhandledRejection');
    });
  }

  emitError(error: any, context?: string, response?: Response) {
    this.eventEmitter.emitAsync('error.occurred', { error, context, response });  
    console.error(`Error occurred in ${context}:`, error);
  }
}
