import { Module } from "@nestjs/common";
import { WebSocialService } from "./web-social.service";
import { WebSocialController } from "./web-social.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebSocialController],
  providers: [WebSocialService],
  exports: [WebSocialService],
})
export class WebSocialModule {}
