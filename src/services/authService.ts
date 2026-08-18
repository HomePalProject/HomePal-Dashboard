import type { User } from '@store/authStore';
import type { ApiResponse } from '@typeDefs/apiTypes';
import type { LoginCredentials, LoginResponseData } from '@typeDefs/authTypes';
import { api } from '@services/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
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
      roles: meData?.roles || ['Admin'],
    };

    return { token, user };
  },

  async getMe(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    return response.data;
  },
};
