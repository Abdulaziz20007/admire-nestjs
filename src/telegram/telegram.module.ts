import { Module, forwardRef } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { MessageModule } from "../message/message.module";
import { TelegramService } from "./telegram.service";
import { TelegramController } from "./telegram.controller";

@Module({
  imports: [HttpModule, ConfigModule, forwardRef(() => MessageModule)],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
