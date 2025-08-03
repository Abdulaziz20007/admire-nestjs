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
import { IconService } from "./icon.service";
import { CreateIconDto } from "./dto/create-icon.dto";
import { UpdateIconDto } from "./dto/update-icon.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("icon")
@UseGuards(AccessTokenGuard)
export class IconController {
  constructor(private readonly iconService: IconService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  create(
    @Body() createIconDto: CreateIconDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.iconService.create(createIconDto, file);
  }

  @Get()
  findAll() {
    return this.iconService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.iconService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateIconDto: UpdateIconDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.iconService.update(id, updateIconDto, file);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.iconService.remove(id);
  }
}
