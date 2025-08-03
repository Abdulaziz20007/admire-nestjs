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
import { WebSocialService } from "./web-social.service";
import { CreateWebSocialDto } from "./dto/create-web-social.dto";
import { UpdateWebSocialDto } from "./dto/update-web-social.dto";
import { AccessTokenGuard } from "../common/guards";

@Controller("web-social")
@UseGuards(AccessTokenGuard)
export class WebSocialController {
  constructor(private readonly webSocialService: WebSocialService) {}

  // @Post()
  // create(@Body() createWebSocialDto: CreateWebSocialDto) {
  //   return this.webSocialService.create(createWebSocialDto);
  // }

  @Get()
  findAll() {
    return this.webSocialService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.webSocialService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateWebSocialDto: UpdateWebSocialDto,
  ) {
    return this.webSocialService.update(id, updateWebSocialDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.webSocialService.remove(id);
  }
}
