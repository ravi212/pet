export type Provider = 'local' | 'google';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  provider: Provider;
  aiOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
  oauthProviderId?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  displayName?: string;
  sessionId?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
  locale?: string;
  provider?: Provider;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  aiOptIn?: boolean;
}
