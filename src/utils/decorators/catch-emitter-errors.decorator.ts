import { HttpException, HttpStatus } from '@nestjs/common';

export function CatchEmitterErrors() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof HttpException) {
          return error;
        } else {
          return new HttpException(
            'An unexpected error occurred',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    };
  };
}
