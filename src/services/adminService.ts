import api from './api';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';

export const adminService = {
  createAdmin: async (data: CreateAdminRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getAdmins: async (
    pageNumber: number = 1,
    pageSize: number = 50,
    roleFilter?: string,
    search?: string
  ) => {
    const params: any = { pageNumber, pageSize };
    if (roleFilter && roleFilter !== 'All') params.Role = roleFilter;
    if (search) params.SearchTerm = search; // Or Search, typically SearchTerm or similar. We will just pass Search. Let's pass both Search and SearchTerm to be safe if backend maps it differently, or just Search.
    // Actually standard is typically `Search` or `SearchTerm`. I will use `Search` as a param.
    if (search) params.Search = search;

    const response = await api.get('/users', { params });
    return response.data;
  },
  getAdminsCount: async () => {
    const response = await api.get('/users', {
      params: { Role: 'Admin', pageNumber: 1, pageSize: 1 },
    });
    return response.data?.data?.totalCount || 0;
  },
  deactivateAdmin: async (id: string) => {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  },
};
