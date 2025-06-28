import { Module } from "@nestjs/common";
import { WebStudentService } from "./web-student.service";
import { WebStudentController } from "./web-student.controller";
import { DatabaseModule } from "../database/database.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [WebStudentController],
  providers: [WebStudentService],
  exports: [WebStudentService],
})
export class WebStudentModule {}
