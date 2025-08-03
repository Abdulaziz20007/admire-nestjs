import { Controller, Post, Body, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminLoginDto } from "./dto/create-auth.dto";
import { Response } from "express";
import { CookieGetter } from "../common/decorators/cookie-getter.decorator";
import { AccessTokenGuard, RefreshTokenGuard } from "../common/guards";
import { Public } from "../common/decorators/public.decorator";

@Controller("auth")
@UseGuards(AccessTokenGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(
    @Body() adminLoginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(adminLoginDto, res);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refresh(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(refreshToken, res);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("logout")
  async logout(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(refreshToken, res);
  }
}
