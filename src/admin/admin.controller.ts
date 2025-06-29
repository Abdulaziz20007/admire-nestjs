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
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AccessTokenGuard } from "../common/guards";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "../common/decorators/public.decorator";

@Controller("admin")
@UseGuards(AccessTokenGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Public()
  @Post()
  @UseInterceptors(FileInterceptor("avatar"))
  create(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() avatar: Express.Multer.File
  ) {
    return this.adminService.create(createAdminDto, avatar);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("avatar"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
    @UploadedFile() avatar: Express.Multer.File
  ) {
    return this.adminService.update(id, updateAdminDto, avatar);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }
}
