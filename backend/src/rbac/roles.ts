/**
 * RBAC Roles and Permissions Configuration
 * Defines all roles and their associated permissions
 */

export enum Role {
  OWNER = 'owner',
  EDITOR = 'editor',
  COMMENTER = 'commenter',
  VIEWER = 'viewer',
}

export enum Permission {
  // Project Management
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Collaborator Management
  COLLABORATOR_ADD = 'collaborator:add',
  COLLABORATOR_READ = 'collaborator:read',
  COLLABORATOR_UPDATE = 'collaborator:update',
  COLLABORATOR_DELETE = 'collaborator:delete',

  // Expense Management
  EXPENSE_CREATE = 'expense:create',
  EXPENSE_READ = 'expense:read',
  EXPENSE_UPDATE = 'expense:update',
  EXPENSE_DELETE = 'expense:delete',

  // Task Management
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',

  // Category Management
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // Cycle Management
  CYCLE_CREATE = 'cycle:create',
  CYCLE_READ = 'cycle:read',
  CYCLE_UPDATE = 'cycle:update',
  CYCLE_DELETE = 'cycle:delete',

  // Receipt Management
  RECEIPT_CREATE = 'receipt:create',
  RECEIPT_READ = 'receipt:read',
  RECEIPT_UPDATE = 'receipt:update',
  RECEIPT_DELETE = 'receipt:delete',

  // Comments
  COMMENT_CREATE = 'comment:create',
  COMMENT_READ = 'comment:read',
  COMMENT_DELETE = 'comment:delete',
}

/**
 * Permission Matrix
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    // Full access to all operations
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.COLLABORATOR_ADD,
    Permission.COLLABORATOR_READ,
    Permission.COLLABORATOR_UPDATE,
    Permission.COLLABORATOR_DELETE,
    Permission.EXPENSE_CREATE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_UPDATE,
    Permission.EXPENSE_DELETE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    Permission.CYCLE_CREATE,
    Permission.CYCLE_READ,
    Permission.CYCLE_UPDATE,
    Permission.CYCLE_DELETE,
    Permission.RECEIPT_CREATE,
    Permission.RECEIPT_READ,
    Permission.RECEIPT_UPDATE,
    Permission.RECEIPT_DELETE,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
  ],

  [Role.EDITOR]: [
    // Read-only and create/update for own resources
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.COLLABORATOR_READ,
    Permission.EXPENSE_CREATE,
    Permission.EXPENSE_READ,
    Permission.EXPENSE_UPDATE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CYCLE_CREATE,
    Permission.CYCLE_READ,
    Permission.CYCLE_UPDATE,
    Permission.RECEIPT_CREATE,
    Permission.RECEIPT_READ,
    Permission.RECEIPT_UPDATE,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
  ],

  [Role.COMMENTER]: [
    // Read-only and comment permissions
    Permission.PROJECT_READ,
    Permission.COLLABORATOR_READ,
    Permission.EXPENSE_READ,
    Permission.TASK_READ,
    Permission.CATEGORY_READ,
    Permission.CYCLE_READ,
    Permission.RECEIPT_READ,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
  ],

  [Role.VIEWER]: [
    // Read-only access
    Permission.PROJECT_READ,
    Permission.COLLABORATOR_READ,
    Permission.EXPENSE_READ,
    Permission.TASK_READ,
    Permission.CATEGORY_READ,
    Permission.CYCLE_READ,
    Permission.RECEIPT_READ,
    Permission.COMMENT_READ,
  ],
};

/**
 * Helper function to check if a role has a permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Helper function to check if a role has any of the given permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Helper function to check if a role has all of the given permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
