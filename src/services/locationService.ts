import { api } from './api';
import type { GovernorateResponse, CityResponse } from '@typeDefs/locationTypes';

export const locationService = {
  getGovernorates: async (): Promise<GovernorateResponse[]> => {
    const response = await api.get('/locations/governorates');
    return response.data;
  },
  getCitiesByGovernorate: async (governorateId: string): Promise<CityResponse[]> => {
    const response = await api.get(`/locations/governorates/${governorateId}/cities`);
    return response.data;
  },
};
