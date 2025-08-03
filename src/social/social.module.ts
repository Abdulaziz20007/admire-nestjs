import { Module } from "@nestjs/common";
import { SocialService } from "./social.service";
import { SocialController } from "./social.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
