import { environment } from "../../../environments/environment";

const bseUrl = environment.apiBaseUrl;

export const endpoints = {
  auth: {
    login: `${bseUrl}/auth/login`,
    signup: `${bseUrl}/auth/signup`,
    verifyEmail: (token: string) => `${bseUrl}/auth/verify-email?token=${token}`,
    resendEmail: `${bseUrl}/auth/verify-email`,
    refreshToken: `${bseUrl}/auth/refresh`,
    checkAuth: `${bseUrl}/auth/me`,
    logout: `${bseUrl}/auth/logout`,
    enable2fa: `${bseUrl}/auth/enable-2fa`,
    verify2fa: `${bseUrl}/auth/verify-2fa`,
    disable2fa: `${bseUrl}/auth/disable-2fa`,
  },
  projects: {
    projects: `${bseUrl}/projects`,
    projectById: (id: string) => `${bseUrl}/projects/${id}`,
  },
} as const;
