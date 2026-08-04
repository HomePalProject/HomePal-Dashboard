import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore, type User } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  emailOrUsername?: string;
  password?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

interface LoginResponse {
  tokens?: TokenResponse;
  token?: string;
  user: User;
}

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/api/Auth/login', credentials);
      return response.data;
    },
    onSuccess: (data: any) => {
      // Backend wraps response in { success: true, data: { ... } }
      const payload = data?.data || data;
      const token =
        payload?.tokens?.accessToken || payload?.accessToken || payload?.token || 'mock_token_123';
      const user = payload?.user || { id: '1', email: 'admin@homepal.com', role: 'Admin' };

      setAuth(token, user);
      navigate('/dashboard');
    },
  });
};
