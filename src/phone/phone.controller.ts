import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { PhoneService } from "./phone.service";
import { CreatePhoneDto } from "./dto/create-phone.dto";
import { UpdatePhoneDto } from "./dto/update-phone.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("phone")
@UseGuards(AccessTokenGuard)
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Post()
  create(@Body() createPhoneDto: CreatePhoneDto) {
    return this.phoneService.create(createPhoneDto);
  }

  @Get()
  findAll() {
    return this.phoneService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.phoneService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.phoneService.update(id, updatePhoneDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.phoneService.remove(id);
  }
}
