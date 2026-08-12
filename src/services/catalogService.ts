import api from './api';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';

export const catalogService = {
  getSupermarkets: async (): Promise<Supermarket[]> => {
    const response = await api.get('/api/supermarkets');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  saveSupermarket: async (data: any, id?: string): Promise<any> => {
    if (id) {
      return api.put(`/api/supermarkets/${id}`, data);
    }
    return api.post('/api/supermarkets', data);
  },
  deleteSupermarket: async (id: string): Promise<any> => {
    return api.delete(`/api/supermarkets/${id}`);
  },
  getOffers: async (): Promise<Offer[]> => {
    const response = await api.get('/api/offers');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  saveOffer: async (data: any, id?: string): Promise<any> => {
    if (id) {
      return api.put(`/api/offers/${id}`, data);
    }
    return api.post('/api/offers', data);
  },
  deleteOffer: async (id: string): Promise<any> => {
    return api.delete(`/api/offers/${id}`);
  },
};
