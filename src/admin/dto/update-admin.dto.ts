import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateAdminDto } from "./create-admin.dto";

// Exclude password from updatable fields
export class UpdateAdminDto extends PartialType(
  OmitType(CreateAdminDto, ["password"] as const)
) {}
