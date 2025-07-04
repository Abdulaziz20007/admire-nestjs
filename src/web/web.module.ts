import { Module } from "@nestjs/common";
import { WebService } from "./web.service";
import { WebController } from "./web.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebController],
  providers: [WebService],
  exports: [WebService],
})
export class WebModule {}
