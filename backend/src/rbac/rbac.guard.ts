import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ROLE_KEY,
  PERMISSION_KEY,
  PUBLIC_KEY,
} from './decorators';
import { Role, hasPermission } from './roles';

/**
 * Guard that enforces role and permission-based access control
 * Checks if user has required roles/permissions for the endpoint
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole as Role;

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no role/permission requirements, allow
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    // If user role is not set, deny
    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Check roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `You do not have the required role. Required: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // Check permissions if specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermissionCheck = requiredPermissions.some((permission) =>
        hasPermission(userRole, permission),
      );

      if (!hasPermissionCheck) {
        throw new ForbiddenException(
          `You do not have the required permissions to access this resource`,
        );
      }
    }

    return true;
  }
}
