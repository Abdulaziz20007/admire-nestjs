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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { TeacherService } from "./teacher.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("teacher")
@UseGuards(AccessTokenGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  create(
    @Body() createTeacherDto: CreateTeacherDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.teacherService.create(createTeacherDto, image);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.teacherService.update(id, updateTeacherDto, image);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}
