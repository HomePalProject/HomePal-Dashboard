import type { User } from '../store/authStore';
import type { ApiResponse } from '../types/apiTypes';
import type { LoginCredentials, LoginResponseData } from '../types/authTypes';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await api.post<ApiResponse<LoginResponseData>>('/api/auth/login', credentials);
    const res = response.data;

    if (!res.success || !res.data?.tokens?.accessToken) {
      throw new Error(res.message || 'Login failed. Please check your credentials.');
    }

    const token = res.data.tokens.accessToken;
    const meData = res.data.user;

    const user: User = {
      id: meData?.id || '',
      email: meData?.email || credentials.emailOrUsername || '',
      username: meData?.username || meData?.email || '',
      fullName: meData?.fullName || meData?.username || 'Admin User',
      role: meData?.roles?.[0] || 'Admin',
    };

    return { token, user };
  },
};
