import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/authService';
import { useAuthStore } from '@store/authStore';
import type { LoginCredentials } from '@typeDefs/authTypes';

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      if (!response.user?.roles?.includes('Admin')) {
        throw new Error('adminRequired');
      }
      return response;
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/dashboard');
    },
  });
};
