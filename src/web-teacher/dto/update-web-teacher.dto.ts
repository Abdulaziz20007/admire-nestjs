import { PartialType } from "@nestjs/mapped-types";
import { CreateWebTeacherDto } from "./create-web-teacher.dto";

export class UpdateWebTeacherDto extends PartialType(CreateWebTeacherDto) {}
