import { Module } from "@nestjs/common";
import { IconService } from "./icon.service";
import { IconController } from "./icon.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { CloudflareModule } from "../cloudflare/cloudflare.module";

@Module({
  imports: [DatabaseModule, JwtModule.register({}), CloudflareModule],
  controllers: [IconController],
  providers: [IconService],
  exports: [IconService],
})
export class IconModule {}
