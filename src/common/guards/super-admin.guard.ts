import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

/**
 * Guard that restricts modification actions (create, update, delete) on the Admin
 * resource to the super-admin (id === 1). All other authenticated admins will
 * be denied with 403 Forbidden. Read-only operations should remain protected
 * by the regular AccessTokenGuard and are therefore not handled here.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // In case the AccessTokenGuard has not attached the user payload, deny.
    if (!user || typeof user.id === "undefined") {
      throw new ForbiddenException("Forbidden");
    }

    // `user.id` can come as string (from JWT) or number – normalize to number.
    const id = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

    if (id === 1) {
      return true;
    }

    throw new ForbiddenException(
      "Only the super admin is allowed to perform this action"
    );
  }
}
