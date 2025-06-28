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
import { WebService } from "./web.service";
import { CreateWebDto } from "./dto/create-web.dto";
import { UpdateWebDto } from "./dto/update-web.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web")
@UseGuards(AccessTokenGuard)
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Post()
  create(@Body() createWebDto: CreateWebDto) {
    return this.webService.create(createWebDto);
  }

  @Get()
  findAll() {
    return this.webService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.webService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateWebDto: UpdateWebDto,
  ) {
    return this.webService.update(id, updateWebDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.webService.remove(id);
  }
}
