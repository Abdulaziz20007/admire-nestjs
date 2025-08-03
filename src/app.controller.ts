import { Controller, Headers, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post() // POST api/admirelc.uz/
  web(@Headers("origin") origin: string) {
    const isVisit =
      origin?.includes("admirelc.uz") || origin?.includes("www.admirelc.uz");
    console.log(isVisit);
    return this.appService.web(isVisit);
  }

  @Post("init")
  init() {
    return this.appService.init();
  }
}
