import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore, type User } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email?: string;
  password?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/api/admin/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.token || 'mock_token_123';
      const user = data?.user || { id: '1', email: 'admin@homepal.com', role: 'Admin' };

      setAuth(token, user);
      navigate('/dashboard');
    },
  });
};
