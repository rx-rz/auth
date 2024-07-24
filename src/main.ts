import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './utils/schema-validation/validation.pipe';
import { CentralizedExceptionFilter } from './utils/exceptions/centralized-exception-filter';
import * as cookieParser from 'cookie-parser';
import { ErrorEmitterService } from './utils/exceptions/emit-error-service';
import { EmitErrorInterceptor } from './utils/exceptions/emit-error-interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const errorEmitterService = app.get(ErrorEmitterService);
  errorEmitterService.onModuleInit();

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CentralizedExceptionFilter(errorEmitterService));
  app.useGlobalInterceptors(new EmitErrorInterceptor(errorEmitterService));
  await app.listen(3000);
}
bootstrap();
