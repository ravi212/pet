import { environment } from '../../../environments/environment';

export const baseUrl = environment.apiBaseUrl as string;

export const endpoints = {
  auth: {
    login: `${baseUrl}/auth/login`,
    signup: `${baseUrl}/auth/signup`,
    verifyEmail: (token: string) => `${baseUrl}/auth/verify-email?token=${token}`,
    resendEmail: `${baseUrl}/auth/verify-email`,
    refreshToken: `${baseUrl}/auth/refresh`,
    checkAuth: `${baseUrl}/auth/me`,
    logout: `${baseUrl}/auth/logout`,
    enable2fa: `${baseUrl}/auth/enable-2fa`,
    verify2fa: `${baseUrl}/auth/verify-2fa`,
    disable2fa: `${baseUrl}/auth/disable-2fa`,
  },
  projects: {
    projects: `${baseUrl}/projects`,
    projectById: (id: string) => `${baseUrl}/projects/${id}`,
  },
  expenses: {
    expenses: `${baseUrl}/expenses`,
    expenseById: (id: string) => `${baseUrl}/expenses/${id}`,
  },
  categories: {
    categories: `${baseUrl}/categories`,
    categoryById: (id: string) => `${baseUrl}/categories/${id}`,
  },
  tasks: {
    tasks: `${baseUrl}/tasks`,
    taskById: (id: string) => `${baseUrl}/tasks/${id}`,
  },
  cycles: {
    cycles: `${baseUrl}/cycles`,
    cycleById: (id: string) => `${baseUrl}/cycles/${id}`,
    toggleLock: (id: string) => `${baseUrl}/cycles/${id}/toggle-lock`,
  },
  receipts: {
    receipts: `${baseUrl}/receipts`,
    upload: `${baseUrl}/receipts/upload`,
    receiptById: (id: string) => `${baseUrl}/receipts/${id}`,
  }
} as const;
