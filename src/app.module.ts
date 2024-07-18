import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OtpModule } from './otp/otp.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [AdminModule, OtpModule],
})
export class AppModule {}
