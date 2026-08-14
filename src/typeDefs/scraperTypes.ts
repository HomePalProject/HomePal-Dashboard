import type { Offer } from './catalogTypes';

export interface ScrapeFacebookPageRequest {
  supermarketId: string;
  pageUrl: string;
  daysBack?: number;
  resultsLimit?: number;
}

export interface ScrapeImageFileRequest {
  supermarketId: string;
  imageFile: File;
  ocrText?: string;
  caption?: string;
}

export interface ScraperJobStatus {
  isRunning: boolean;
  supermarketId?: string | null;
  totalScrapedImages?: number;
  totalExtractedOffers?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  statusMessage?: string;
  errorMessage?: string | null;
}

export interface OfferScraperResult {
  createdOffers?: Offer[];
  totalScrapedImages?: number;
  totalExtractedOffers?: number;
}

export interface ScraperHistoryItem {
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
