import { Controller, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  web() {
    return this.appService.web();
  }

  @Post("init")
  init() {
    return this.appService.init();
  }
}
