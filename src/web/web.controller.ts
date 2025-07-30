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
import { WebService } from "./web.service";
import { CreateWebDto } from "./dto/create-web.dto";
import { UpdateWebDto } from "./dto/update-web.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("web")
@UseGuards(AccessTokenGuard)
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Post()
  @UseInterceptors(FileInterceptor("header_img"))
  create(
    @Body() createWebDto: CreateWebDto,
    @UploadedFile() header_img: Express.Multer.File
  ) {
    return this.webService.create(createWebDto, header_img);
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
  @UseInterceptors(FileInterceptor("header_img"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateWebDto: UpdateWebDto,
    @UploadedFile() header_img: Express.Multer.File
  ) {
    return this.webService.update(id, updateWebDto, header_img);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.webService.remove(id);
  }

  @Post("active/:id")
  setActiveWeb(@Param("id", ParseIntPipe) id: number) {
    return this.webService.setActiveWeb(id);
  }
}
