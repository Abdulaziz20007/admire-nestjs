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
  UploadedFiles,
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

@Controller("student")
@UseGuards(AccessTokenGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "certificate_image", maxCount: 1 },
    ])
  )
  create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificate_image?: Express.Multer.File[];
    }
  ) {
    return this.studentService.create(createStudentDto, files);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "certificate_image", maxCount: 1 },
    ])
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificate_image?: Express.Multer.File[];
    }
  ) {
    return this.studentService.update(id, updateStudentDto, files);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }
}
