import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions, ROLE_PERMISSIONS } from './roles';

/**
 * Service for checking permissions at runtime
 * Used in service methods for dynamic permission checks
 */
@Injectable()
export class PermissionsService {
  /**
   * Check if a role has a specific permission
   * Throws ForbiddenException if not authorized
   */
  checkPermission(role: Role, permission: Permission, errorMessage?: string): void {
    if (!hasPermission(role, permission)) {
      throw new ForbiddenException(
        errorMessage || `You do not have permission to perform this action`,
      );
    }
  }

  /**
   * Check if a role has any of the given permissions
   * Throws ForbiddenException if not authorized
   */
  checkAnyPermission(role: Role, permissions: Permission[], errorMessage?: string): void {
    if (!hasAnyPermission(role, permissions)) {
      throw new ForbiddenException(
        errorMessage || `You do not have permission to perform this action`,
      );
    }
  }

  /**
   * Check if a role has all of the given permissions
   * Throws ForbiddenException if not authorized
   */
  checkAllPermissions(role: Role, permissions: Permission[], errorMessage?: string): void {
    if (!hasAllPermissions(role, permissions)) {
      throw new ForbiddenException(
        errorMessage || `You do not have permission to perform this action`,
      );
    }
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
  }

  /**
   * Check if a role is owner
   */
  isOwner(role: Role): boolean {
    return role === Role.OWNER;
  }

  /**
   * Check if a role is editor or higher
   */
  isEditorOrHigher(role: Role): boolean {
    return role === Role.OWNER || role === Role.EDITOR;
  }

  /**
   * Check if a role is commenter or higher
   */
  isCommenterOrHigher(role: Role): boolean {
    return role === Role.OWNER || role === Role.EDITOR || role === Role.COMMENTER;
  }
}
