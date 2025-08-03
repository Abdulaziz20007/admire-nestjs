import { Module } from "@nestjs/common";
import { WebTeacherService } from "./web-teacher.service";
import { WebTeacherController } from "./web-teacher.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebTeacherController],
  providers: [WebTeacherService],
  exports: [WebTeacherService],
})
export class WebTeacherModule {}
