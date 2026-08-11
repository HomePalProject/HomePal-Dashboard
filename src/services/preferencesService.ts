import api from './api';
import type {
  PreferenceResponse,
  PreferenceCategoryResponse,
  AddPreferenceRequest,
  CreateCategoryRequest,
} from '@typeDefs/preferencesTypes';

export const preferencesService = {
  getCategories: async (): Promise<PreferenceCategoryResponse[]> => {
    const response = await api.get('/api/preferences/categories');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  getPreferences: async (
    searchQuery?: string,
    categoryId?: string
  ): Promise<PreferenceResponse[]> => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (categoryId) params.set('categoryId', categoryId);

    const endpoint = searchQuery
      ? `/api/preferences/search?${params.toString()}`
      : `/api/preferences?${params.toString()}`;

    const response = await api.get(endpoint);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createPreference: async (data: AddPreferenceRequest) => {
    const payload = {
      categoryId: data.categoryId,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.post('/api/preferences', payload);
    return response.data;
  },

  updatePreference: async (id: string, data: AddPreferenceRequest) => {
    const payload = {
      id,
      categoryId: data.categoryId,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.put(`/api/preferences/${id}`, payload);
    return response.data;
  },

  deletePreference: async (id: string) => {
    const response = await api.delete(`/api/preferences/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest) => {
    const payload = {
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.post('/api/preferences/categories', payload);
    return response.data;
  },

  updateCategory: async (id: string, data: CreateCategoryRequest) => {
    const payload = {
      id,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.put(`/api/preferences/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/api/preferences/categories/${id}`);
    return response.data;
  },
};
