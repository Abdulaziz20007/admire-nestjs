import { Module } from "@nestjs/common";
import { PhoneService } from "./phone.service";
import { PhoneController } from "./phone.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [PhoneController],
  providers: [PhoneService],
  exports: [PhoneService],
})
export class PhoneModule {}
