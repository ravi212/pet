import { SetMetadata } from '@nestjs/common';
import { Role, Permission } from './roles';

/**
 * Decorator to specify required roles for an endpoint
 * Usage: @RequireRole(Role.OWNER, Role.EDITOR)
 */
export const ROLE_KEY = 'roles';
export const RequireRole = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);

/**
 * Decorator to specify required permissions for an endpoint
 * Usage: @RequirePermission(Permission.EXPENSE_CREATE)
 */
export const PERMISSION_KEY = 'permissions';
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

/**
 * Decorator to allow public access without role check
 * Usage: @Public()
 */
export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
