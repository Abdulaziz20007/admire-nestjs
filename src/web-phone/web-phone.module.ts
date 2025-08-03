import { Module } from "@nestjs/common";
import { WebPhoneService } from "./web-phone.service";
import { WebPhoneController } from "./web-phone.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebPhoneController],
  providers: [WebPhoneService],
  exports: [WebPhoneService],
})
export class WebPhoneModule {}
