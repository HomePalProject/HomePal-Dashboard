export interface LoginCredentials {
  emailOrUsername?: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

export interface LoginResponseData {
  user: UserResponse;
  tokens: AuthTokens;
}
export interface UserResponse {
  id: string;
  fullName: string;
  gender?: string | null;
  username: string;
  email: string;
  phoneNumber?: string | null;
  birthDate?: string | null;
  governorate?: string | null;
  city?: string | null;
  isActive: boolean;
  isProfileComplete: boolean;
  profileImageUrl?: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  roles?: string[];
}
