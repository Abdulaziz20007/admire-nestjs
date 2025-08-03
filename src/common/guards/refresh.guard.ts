import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    async function verify() {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: process.env.REFRESH_KEY,
        });
        req.user = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException("Invalid refresh token");
      }
    }
    return verify.call(this);
  }
}
