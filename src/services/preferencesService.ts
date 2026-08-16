import api from './api';
import type {
  PreferenceResponse,
  PreferenceCategoryResponse,
  AddPreferenceRequest,
  CreateCategoryRequest,
} from '@typeDefs/preferencesTypes';

export const preferencesService = {
  getCategories: async (): Promise<PreferenceCategoryResponse[]> => {
    const response = await api.get('/preferences/categories');
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
      ? `/preferences/search?${params.toString()}`
      : `/preferences?${params.toString()}`;

    const response = await api.get(endpoint);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createPreference: async (data: AddPreferenceRequest) => {
    const payload = {
      categoryId: data.categoryId,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.post('/preferences', payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  updatePreference: async (id: string, data: AddPreferenceRequest) => {
    const payload = {
      id,
      categoryId: data.categoryId,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.put(`/preferences/${id}`, payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deletePreference: async (id: string) => {
    const response = await api.delete(`/preferences/${id}`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createCategory: async (data: CreateCategoryRequest) => {
    const payload = {
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.post('/preferences/categories', payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  updateCategory: async (id: string, data: CreateCategoryRequest) => {
    const payload = {
      id,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const response = await api.put(`/preferences/categories/${id}`, payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/preferences/categories/${id}`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
};
