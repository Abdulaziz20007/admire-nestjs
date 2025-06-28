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
import { MediaService } from "./media.service";
import { CreateMediaDto } from "./dto/create-media.dto";
import { UpdateMediaDto } from "./dto/update-media.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("media")
@UseGuards(AccessTokenGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.create(createMediaDto, file);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.update(id, updateMediaDto, file);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
