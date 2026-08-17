import api from './api';
import type { ProductCategory, CreateUpdateCategoryPayload } from '@typeDefs/productCategoryTypes';

export const productCategoryService = {
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await api.get('/products/categories');
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  searchCategories: async (query: string): Promise<ProductCategory[]> => {
    const response = await api.get(`/products/categories/search`, {
      params: { query },
    });
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  getCategoryById: async (id: string, acceptLanguage?: 'en' | 'ar'): Promise<ProductCategory> => {
    const response = await api.get(
      `/products/categories/${id}`,
      acceptLanguage ? { headers: { 'Accept-Language': acceptLanguage } } : undefined
    );
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createCategory: async (payload: CreateUpdateCategoryPayload): Promise<ProductCategory> => {
    const response = await api.post('/products/categories', payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  updateCategory: async (
    id: string,
    payload: CreateUpdateCategoryPayload
  ): Promise<ProductCategory> => {
    const response = await api.put(`/products/categories/${id}`, payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/products/categories/${id}`);
  },

  uploadCategoryImage: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('Image', file);
    const response = await api.post(`/products/categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deleteCategoryImage: async (id: string): Promise<any> => {
    const response = await api.delete(`/products/categories/${id}/image`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
};
