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
import { WebMediaService } from "./web-media.service";
import { CreateWebMediaDto } from "./dto/create-web-media.dto";
import { UpdateWebMediaDto } from "./dto/update-web-media.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web-media")
@UseGuards(AccessTokenGuard)
export class WebMediaController {
  constructor(private readonly webMediaService: WebMediaService) {}

  @Post()
  create(@Body() createWebMediaDto: CreateWebMediaDto) {
    return this.webMediaService.create(createWebMediaDto);
  }

  @Get()
  findAll() {
    return this.webMediaService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.webMediaService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWebMediaDto: UpdateWebMediaDto,
  ) {
    return this.webMediaService.update(id, updateWebMediaDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.webMediaService.remove(id);
  }
}
