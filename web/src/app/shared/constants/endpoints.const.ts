import { environment } from "../../../environments/environment";

const bseUrl = environment.apiBaseUrl;

export const endpoints = {
  auth: {
    login: `${bseUrl}/auth/login`,
    signup: `${bseUrl}/auth/signup`,
    verifyEmail: `${bseUrl}/auth/verify-email`,
  },
} as const;
