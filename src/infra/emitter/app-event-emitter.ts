import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class AppEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit<T>(event: string, data: T) {
    const results = await this.eventEmitter.emitAsync(event, data);
    for (let i of results) {
      if (
        i instanceof HttpException ||
        i instanceof PrismaClientKnownRequestError ||
        i instanceof PrismaClientUnknownRequestError
      ) {
        throw i;
      }
    }
  }
}
