import { PartialType } from "@nestjs/mapped-types";
import { CreateWebPhoneDto } from "./create-web-phone.dto";

export class UpdateWebPhoneDto extends PartialType(CreateWebPhoneDto) {}
