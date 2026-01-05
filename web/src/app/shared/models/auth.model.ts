import { Provider } from "../enums";
import { User } from "./user.model";

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  refreshToken?: string;
  verificationEmailSent?: boolean;
  message: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
  locale?: string;
  provider?: Provider;
}

