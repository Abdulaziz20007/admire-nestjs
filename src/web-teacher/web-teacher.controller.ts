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
import { WebTeacherService } from "./web-teacher.service";
import { CreateWebTeacherDto } from "./dto/create-web-teacher.dto";
import { UpdateWebTeacherDto } from "./dto/update-web-teacher.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web-teacher")
@UseGuards(AccessTokenGuard)
export class WebTeacherController {
  constructor(private readonly webTeacherService: WebTeacherService) {}

  @Post()
  create(@Body() createWebTeacherDto: CreateWebTeacherDto) {
    return this.webTeacherService.create(createWebTeacherDto);
  }

  @Get()
  findAll() {
    return this.webTeacherService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.webTeacherService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWebTeacherDto: UpdateWebTeacherDto,
  ) {
    return this.webTeacherService.update(id, updateWebTeacherDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.webTeacherService.remove(id);
  }
}
