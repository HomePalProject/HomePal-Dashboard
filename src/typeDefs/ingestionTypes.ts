import type { Offer } from './catalogTypes';

export interface IngestFacebookPageRequest {
  supermarketId: string;
  pageUrl: string;
  daysBack?: number;
  resultsLimit?: number;
}

export interface IngestImageFileRequest {
  supermarketId: string;
  imageFile: File;
  ocrText?: string;
  caption?: string;
}

export interface IngestionJobStatus {
  isRunning: boolean;
  supermarketId?: string | null;
  totalIngestedImages?: number;
  totalExtractedOffers?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  statusMessage?: string;
  errorMessage?: string | null;
}

export interface OfferIngestionResult {
  createdOffers?: Offer[];
  totalIngestedImages?: number;
  totalExtractedOffers?: number;
}

export interface IngestionHistoryItem {
  id: string;
  source: 'Facebook' | 'Flyer Upload';
  brand: string;
  supermarketId?: string;
  status: 'Running' | 'Completed' | 'Action Required' | 'Failed';
  parsedCount: number;
  totalCount?: number;
  startedAt: string;
  offers?: Offer[];
}
