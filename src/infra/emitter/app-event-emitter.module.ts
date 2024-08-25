import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppEventEmitter } from "./app-event-emitter";

@Global()
@Module({
  imports: [EventEmitterModule.forRoot({
    ignoreErrors: false,
    wildcard: false
  })],
  providers: [AppEventEmitter],
  exports: [AppEventEmitter],
})
export class AppEventEmitterModule {}