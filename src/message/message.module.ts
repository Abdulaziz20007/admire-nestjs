import { Module, forwardRef } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
    forwardRef(() => TelegramModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
