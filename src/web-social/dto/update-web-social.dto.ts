import { PartialType } from "@nestjs/mapped-types";
import { CreateWebSocialDto } from "./create-web-social.dto";

export class UpdateWebSocialDto extends PartialType(CreateWebSocialDto) {}
