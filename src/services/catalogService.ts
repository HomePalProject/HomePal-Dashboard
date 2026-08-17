import api from './api';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';

export const catalogService = {
  getSupermarkets: async (): Promise<Supermarket[]> => {
    const response = await api.get('/supermarkets');
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
      return api.put(`/supermarkets/${id}`, payload);
    }
    return api.post('/supermarkets', payload);
  },
  deleteSupermarket: async (id: string): Promise<void> => {
    return api.delete(`/supermarkets/${id}`);
  },
  getSupermarketById: async (id: string, acceptLanguage?: 'en' | 'ar'): Promise<Supermarket> => {
    const response = await api.get(
      `/supermarkets/${id}`,
      acceptLanguage ? { headers: { 'Accept-Language': acceptLanguage } } : undefined
    );
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  uploadSupermarketLogo: async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('Image', file);
    return api.post(`/supermarkets/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteSupermarketLogo: async (id: string): Promise<any> => {
    return api.delete(`/supermarkets/${id}/logo`);
  },
  getOffers: async (params?: {
    onlyVerified?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Offer[]> => {
    const response = await api.get('/offers', {
      params: { onlyVerified: false, pageSize: 1000, ...params },
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
      return api.put(`/offers/${id}`, data);
    }
    return api.post('/offers', data);
  },
  deleteOffer: async (id: string): Promise<void> => {
    return api.delete(`/offers/${id}`);
  },
  getOfferById: async (id: string, acceptLanguage?: 'en' | 'ar'): Promise<Offer> => {
    const response = await api.get(
      `/offers/${id}`,
      acceptLanguage ? { headers: { 'Accept-Language': acceptLanguage } } : undefined
    );
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
};
