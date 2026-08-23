import api from './api';
import type {
  IngestFacebookPageRequest,
  IngestionJobStatus,
  OfferIngestionResult,
} from '@typeDefs/ingestionTypes';

export const ingestionService = {
  getJobStatus: async (): Promise<IngestionJobStatus> => {
    const response = await api.get('/offers/scrape/status');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  ingestFacebookPage: async (data: IngestFacebookPageRequest): Promise<OfferIngestionResult> => {
    const response = await api.post('/offers/scrape/facebook-page', data);
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  ingestImageFile: async (
    supermarketId: string,
    file: File,
    ocrText?: string,
    caption?: string
  ): Promise<OfferIngestionResult> => {
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
