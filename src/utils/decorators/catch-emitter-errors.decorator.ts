import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';

export function CatchEmitterErrors() {
  // this function wraps the decorated function in a try-catch block
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        if (
          error instanceof PrismaClientUnknownRequestError ||
          error instanceof PrismaClientKnownRequestError
        ) {
          // for some reason, prisma errors need to be returned, not thrown
          // for them to be caught by the centralized exception filter.
          return error;
        }
        throw error;
      }
    };

    return descriptor;
  };
}
