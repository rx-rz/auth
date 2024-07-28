import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './utils/schema-validation/validation.pipe';
import { CentralizedExceptionFilter } from './utils/exceptions/centralized-exception-filter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet())
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CentralizedExceptionFilter());
  await app.listen(3000);
}
bootstrap();
