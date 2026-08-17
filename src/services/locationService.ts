import { api } from './api';
import type { GovernorateResponse, CityResponse } from '@typeDefs/locationTypes';
import type { ApiResponse } from '@typeDefs/apiTypes';

export const locationService = {
  getGovernorates: async (): Promise<GovernorateResponse[]> => {
    const response = await api.get<ApiResponse<GovernorateResponse[]>>('/locations/governorates');
    return response.data.data || [];
  },
  getCitiesByGovernorate: async (governorateId: string): Promise<CityResponse[]> => {
    const response = await api.get<ApiResponse<CityResponse[]>>(
      `/locations/governorates/${governorateId}/cities`
    );
    return response.data.data || [];
  },
};
