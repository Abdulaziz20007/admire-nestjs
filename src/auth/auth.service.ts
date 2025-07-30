import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AdminLoginDto } from "./dto/create-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { AdminService } from "../admin/admin.service";
import { admins } from "../drizzle/schema";
import { ConfigService } from "@nestjs/config";

type Admin = typeof admins.$inferSelect;

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async getTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      name: admin.name,
      surname: admin.surname,
      username: admin.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("ACCESS_KEY"),
        expiresIn: this.configService.get<string>("ACCESS_TIME"),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("REFRESH_KEY"),
        expiresIn: this.configService.get<string>("REFRESH_TIME"),
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  COOKIE_OPTIONS(is_refresh: boolean): object {
    const maxAgeInMs = is_refresh
      ? parseInt(
          this.configService.get<string>("REFRESH_TIME_COOKIE", "864000000")
        )
      : parseInt(
          this.configService.get<string>("ACCESS_TIME_COOKIE", "86400000")
        );
    return {
      httpOnly: true,
      maxAge: maxAgeInMs,
      sameSite: "lax",
      secure: false,
    };
  }

  async login(adminLoginDto: AdminLoginDto, res: Response) {
    const admin = await this.adminService.findOneByUsername(
      adminLoginDto.username
    );

    if (!admin || admin.password !== adminLoginDto.password) {
      throw new UnauthorizedException("Username or password is incorrect");
    }

    const tokens = await this.getTokens(admin);
    await this.adminService.saveRefreshToken(admin.id, tokens.refresh_token);

    res.cookie(
      "refresh_token",
      tokens.refresh_token,
      this.COOKIE_OPTIONS(true)
    );

    return {
      message: "Admin logged in successfully",
      access_token: tokens.access_token,
    };
  }

  async refreshToken(refreshToken: string, res: Response) {
    const admin = await this.adminService.findOneByRefreshToken(refreshToken);
    if (!admin) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const tokens = await this.getTokens(admin);
    await this.adminService.saveRefreshToken(admin.id, tokens.refresh_token);

    res.cookie(
      "refresh_token",
      tokens.refresh_token,
      this.COOKIE_OPTIONS(true)
    );
    return { access_token: tokens.access_token };
  }

  async logout(refreshToken: string, res: Response) {
    await this.adminService.removeRefreshToken(refreshToken);
    res.clearCookie("refresh_token");
    return { message: "Admin logged out successfully" };
  }
}
