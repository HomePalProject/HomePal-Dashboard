import api from './api';
import type {
  MeasuringUnit,
  CreateMeasuringUnitPayload,
  UpdateMeasuringUnitPayload,
} from '@typeDefs/measuringUnitTypes';

export const measuringUnitService = {
  getUnits: async (): Promise<MeasuringUnit[]> => {
    const response = await api.get('/api/units');
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  searchUnits: async (query: string): Promise<MeasuringUnit[]> => {
    const response = await api.get('/api/units/search', {
      params: { query },
    });
    const data = response.data?.data !== undefined ? response.data.data : response.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    return [];
  },

  getUnitById: async (id: string): Promise<MeasuringUnit> => {
    const response = await api.get(`/api/units/${id}`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  createUnit: async (payload: CreateMeasuringUnitPayload): Promise<MeasuringUnit> => {
    const response = await api.post('/api/units', payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  updateUnit: async (id: string, payload: UpdateMeasuringUnitPayload): Promise<MeasuringUnit> => {
    const response = await api.put(`/api/units/${id}`, payload);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  deleteUnit: async (id: string): Promise<void> => {
    await api.delete(`/api/units/${id}`);
  },
};
