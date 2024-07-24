import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ErrorEmitterService } from './emit-error-service';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class EmitErrorInterceptor implements NestInterceptor {
  constructor(private errorEmitterService: ErrorEmitterService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        this.errorEmitterService.emitError(
          error,
          context.getClass().name,
          response,
        );
        return throwError(() => error);
      }),
    );
  }
}
