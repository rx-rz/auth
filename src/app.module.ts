import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './db/database.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [AdminModule, OtpModule, DatabaseModule],
})
export class AppModule {}
