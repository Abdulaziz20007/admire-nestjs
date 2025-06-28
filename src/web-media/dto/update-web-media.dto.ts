import { PartialType } from "@nestjs/mapped-types";
import { CreateWebMediaDto } from "./create-web-media.dto";

export class UpdateWebMediaDto extends PartialType(CreateWebMediaDto) {}
