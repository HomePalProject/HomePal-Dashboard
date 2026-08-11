import api from './api';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';

export const adminService = {
  createAdmin: async (data: CreateAdminRequest) => {
    const response = await api.post('/api/Auth/register', data);
    return response.data;
  },
};
