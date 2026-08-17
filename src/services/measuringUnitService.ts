import api from './api';
import type {
  MeasuringUnit,
  CreateMeasuringUnitPayload,
  UpdateMeasuringUnitPayload,
} from '@typeDefs/measuringUnitTypes';

export const measuringUnitService = {
  getUnits: async (): Promise<MeasuringUnit[]> => {
    const response = await api.get('/units');
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  searchUnits: async (query: string): Promise<MeasuringUnit[]> => {
    const response = await api.get('/units/search', {
      params: { query },
    });
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  getUnitById: async (id: string, acceptLanguage?: 'en' | 'ar'): Promise<MeasuringUnit> => {
    const response = await api.get(
      `/units/${id}`,
      acceptLanguage ? { headers: { 'Accept-Language': acceptLanguage } } : undefined
    );
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createUnit: async (payload: CreateMeasuringUnitPayload): Promise<MeasuringUnit> => {
    const response = await api.post('/units', payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  updateUnit: async (id: string, payload: UpdateMeasuringUnitPayload): Promise<MeasuringUnit> => {
    const response = await api.put(`/units/${id}`, payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deleteUnit: async (id: string): Promise<void> => {
    await api.delete(`/units/${id}`);
  },
};
