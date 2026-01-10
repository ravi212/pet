export const AUTH_ROUTES = {
  ROOT: 'auth',
  LOGIN: 'login',
  SIGNUP: 'signup',
  VERIFY_EMAIL: 'verify-email',
} as const;

export const PROJECT_ROUTES = {
  ROOT: 'project',
  LIST: 'list',
  CREATE: 'create',
  ID: ':projectId',
  DASHBOARD: 'dashboard',
  EXPENSES: 'expense',
  TASKS: 'task',
  CYCLES: 'cycle',
  RECEIPTS: 'receipt',
  SETTINGS: 'settings',
  CATEGORIES: 'category',
} as const;
