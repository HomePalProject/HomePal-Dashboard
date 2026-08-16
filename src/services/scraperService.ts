import api from './api';
import type {
  ScrapeFacebookPageRequest,
  ScraperJobStatus,
  OfferScraperResult,
} from '@typeDefs/scraperTypes';

export const scraperService = {
  getJobStatus: async (): Promise<ScraperJobStatus> => {
    const response = await api.get('/offers/scrape/status');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  scrapeFacebookPage: async (data: ScrapeFacebookPageRequest): Promise<OfferScraperResult> => {
    const response = await api.post('/offers/scrape/facebook-page', data);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  scrapeImageFile: async (
    supermarketId: string,
    file: File,
    ocrText?: string,
    caption?: string
  ): Promise<OfferScraperResult> => {
    const formData = new FormData();
    formData.append('SupermarketId', supermarketId);
    formData.append('ImageFile', file);
    if (ocrText) formData.append('OcrText', ocrText);
    if (caption) formData.append('Caption', caption);

    const response = await api.post('/offers/scrape/image-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
};
