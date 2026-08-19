import axios from 'axios';
import { useAuthStore } from '@store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const currentLang = localStorage.getItem('hp-language') || 'en';
    if (config.headers) {
      config.headers['Accept-Language'] = currentLang;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url ?? '').toLowerCase();
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
