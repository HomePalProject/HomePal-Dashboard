import api from './api';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';

export const catalogService = {
  getSupermarkets: async (): Promise<Supermarket[]> => {
    const response = await api.get('/api/supermarkets');
    const data = response.data?.data;
    // Handle paginated response: { data: { items: [...] } }
    if (data?.items && Array.isArray(data.items)) return data.items;
    // Handle flat array response: { data: [...] }
    if (Array.isArray(data)) return data;
    return [];
  },
  saveSupermarket: async (data: Partial<Supermarket>, id?: string): Promise<Supermarket> => {
    const rawName = data.name;
    const formattedName =
      typeof rawName === 'string'
        ? [{ culture: 'en-US', languageCode: 'en-US', value: rawName.trim() }]
        : Array.isArray(rawName)
          ? rawName.map((n: any) => ({
              culture: n.culture || n.languageCode || 'en-US',
              languageCode: n.languageCode || n.culture || 'en-US',
              value: n.value || '',
            }))
          : [{ culture: 'en-US', languageCode: 'en-US', value: '' }];

    const payload = {
      name: formattedName,
      logoPath: (data as any).logoPath || null,
      address: (data as any).address || null,
      websiteUrl: (data as any).websiteUrl || null,
    };

    if (id) {
      return api.put(`/api/supermarkets/${id}`, payload);
    }
    return api.post('/api/supermarkets', payload);
  },
  deleteSupermarket: async (id: string): Promise<void> => {
    return api.delete(`/api/supermarkets/${id}`);
  },
  uploadSupermarketLogo: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('Image', file);
    return api.post(`/api/supermarkets/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteSupermarketLogo: async (id: string): Promise<any> => {
    return api.delete(`/api/supermarkets/${id}/logo`);
  },
  getOffers: async (params?: {
    onlyVerified?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Offer[]> => {
    const response = await api.get('/api/offers', {
      params: { onlyVerified: false, pageSize: 100, ...params },
    });
    const data = response.data?.data;
    // Handle paginated response: { data: { items: [...] } }
    if (data?.items && Array.isArray(data.items)) return data.items;
    // Handle flat array response: { data: [...] }
    if (Array.isArray(data)) return data;
    return [];
  },
  saveOffer: async (data: Partial<Offer>, id?: string): Promise<Offer> => {
    if (id) {
      return api.put(`/api/offers/${id}`, data);
    }
    return api.post('/api/offers', data);
  },
  deleteOffer: async (id: string): Promise<void> => {
    return api.delete(`/api/offers/${id}`);
  },
};
