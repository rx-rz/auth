import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/infra/db/database.module';
import { AppEventEmitterModule } from 'src/infra/emitter/app-event-emitter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.test', '.env'],
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    AppEventEmitterModule,
    DatabaseModule,
  ],
  exports: [ConfigModule, JwtModule, AppEventEmitterModule, DatabaseModule],
})
export class TestModule {}
