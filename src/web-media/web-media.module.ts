import { Module } from "@nestjs/common";
import { WebMediaService } from "./web-media.service";
import { WebMediaController } from "./web-media.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebMediaController],
  providers: [WebMediaService],
  exports: [WebMediaService],
})
export class WebMediaModule {}
