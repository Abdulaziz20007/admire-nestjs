import { PartialType } from "@nestjs/mapped-types";
import { CreateWebDto } from "./create-web.dto";

export class UpdateWebDto extends PartialType(CreateWebDto) {}
