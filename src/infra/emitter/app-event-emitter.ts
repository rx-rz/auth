import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AppEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  async emit<T>(event: string, data: T): Promise<void> {
    try {
      const results = await this.eventEmitter.emitAsync(event, data);
      for (let i of results) {
        if (i instanceof HttpException) {
          console.log(i);
          throw i;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
