import { Module } from "@nestjs/common";
import { WebService } from "./web.service";
import { WebController } from "./web.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";
import { CloudflareModule } from "../cloudflare/cloudflare.module";

@Module({
  imports: [DatabaseModule, JwtModule.register({}), CloudflareModule],
  controllers: [WebController],
  providers: [WebService],
  exports: [WebService],
})
export class WebModule {}
