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
  Put,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AccessTokenGuard, SuperAdminGuard } from "../common/guards";
import { ChangeAdminPasswordDto } from "./dto/change-admin-password.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "../common/decorators/public.decorator";

@Controller("admin")
@UseGuards(AccessTokenGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Public()
  @Post()
  @UseGuards(AccessTokenGuard, SuperAdminGuard)
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

  @Delete(":id")
  @UseGuards(AccessTokenGuard, SuperAdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }

  @Put("change-password")
  @Patch("change-password")
  @UseGuards(AccessTokenGuard)
  changePassword(@Body() changePasswordDto: ChangeAdminPasswordDto) {
    return this.adminService.changePassword(changePasswordDto);
  }

  @Patch(":id")
  @UseGuards(AccessTokenGuard, SuperAdminGuard)
  @UseInterceptors(FileInterceptor("avatar"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
    @UploadedFile() avatar: Express.Multer.File
  ) {
    return this.adminService.update(id, updateAdminDto, avatar);
  }
}
