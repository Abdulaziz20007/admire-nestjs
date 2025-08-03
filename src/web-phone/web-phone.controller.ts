import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { WebPhoneService } from "./web-phone.service";
import { CreateWebPhoneDto } from "./dto/create-web-phone.dto";
import { UpdateWebPhoneDto } from "./dto/update-web-phone.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web-phone")
@UseGuards(AccessTokenGuard)
export class WebPhoneController {
  constructor(private readonly webPhoneService: WebPhoneService) {}

  @Post()
  create(@Body() createWebPhoneDto: CreateWebPhoneDto) {
    return this.webPhoneService.create(createWebPhoneDto);
  }

  @Get()
  findAll() {
    return this.webPhoneService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.webPhoneService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWebPhoneDto: UpdateWebPhoneDto,
  ) {
    return this.webPhoneService.update(id, updateWebPhoneDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.webPhoneService.remove(id);
  }
}
