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
import { WebStudentService } from "./web-student.service";
import { CreateWebStudentDto } from "./dto/create-web-student.dto";
import { UpdateWebStudentDto } from "./dto/update-web-student.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web-student")
@UseGuards(AccessTokenGuard)
export class WebStudentController {
  constructor(private readonly webStudentService: WebStudentService) {}

  @Post()
  create(@Body() createWebStudentDto: CreateWebStudentDto) {
    return this.webStudentService.create(createWebStudentDto);
  }

  @Get()
  findAll() {
    return this.webStudentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.webStudentService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateWebStudentDto: UpdateWebStudentDto,
  ) {
    return this.webStudentService.update(id, updateWebStudentDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.webStudentService.remove(id);
  }
}
