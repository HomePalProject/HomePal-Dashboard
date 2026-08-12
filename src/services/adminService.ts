import api from './api';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';

export const adminService = {
  createAdmin: async (data: CreateAdminRequest) => {
    const response = await api.post('/api/Auth/register', data);
    return response.data;
  },
  getAdmins: async (pageNumber: number = 1, pageSize: number = 50) => {
    const response = await api.get('/api/users', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },
  getAdminsCount: async () => {
    const response = await api.get('/api/users', {
      params: { Role: 'Admin', pageNumber: 1, pageSize: 1 },
    });
    return response.data?.data?.totalCount || 0;
  },
  deactivateAdmin: async (id: string) => {
    const response = await api.put(`/api/users/${id}/deactivate`);
    return response.data;
  },
};
