import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

export const CookieGetter = createParamDecorator(
  async (data: string, context: ExecutionContext): Promise<string> => {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies[data];
    if (!token) {
      throw new UnauthorizedException(`${data} token is not found in cookies`);
    }
    return token;
  },
);
