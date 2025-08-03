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
  Req,
} from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { AccessTokenGuard } from "../common/guards";
import { Request } from "express";
import { Public } from "../common/decorators/public.decorator";

@Controller("message")
@UseGuards(AccessTokenGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @Public()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.messageService.findOne(id);
  }

  @Patch(":id/check/:is_checked")
  setChecked(
    @Param("id", ParseIntPipe) id: number,
    @Param("is_checked", ParseIntPipe) is_checked: number,
    @Req() req: Request
  ) {
    return this.messageService.setChecked(id, req.user!.id, is_checked);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.messageService.remove(id);
  }
}
