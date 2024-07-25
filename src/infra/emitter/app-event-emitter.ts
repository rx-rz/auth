import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  async emit<T>(event: string, data: T): Promise<void> {
    try {
      const results = await this.eventEmitter.emitAsync(event, data);
      for (let i of results) {
        if (i instanceof HttpException) {
          throw new HttpException(i.getResponse(), i.getStatus());
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message || 'An error occurred during event processing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
