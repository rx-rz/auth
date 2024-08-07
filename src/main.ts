import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CentralizedExceptionFilter } from './utils/exceptions/centralized-exception-filter';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.use(helmet());
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
