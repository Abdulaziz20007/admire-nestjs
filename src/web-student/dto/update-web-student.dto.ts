import { PartialType } from "@nestjs/mapped-types";
import { CreateWebStudentDto } from "./create-web-student.dto";

export class UpdateWebStudentDto extends PartialType(CreateWebStudentDto) {}
