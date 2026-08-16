import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { PnLDeepDiveData } from '@typeDefs/pnlTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { SupermarketPerformanceData } from '@typeDefs/supermarketTypes';
import type { TokenUsageMetrics } from '@typeDefs/tokenUsageTypes';
import { api } from './api';

// Import fallback constants for endpoints that don't exist yet
import { MOCK_PNL_DATA } from '@constants/pnlData';
import { mockSupermarketPerformanceData } from '@constants/supermarketData';

// Simulated network delay for mock endpoints
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverviewData> => {
    const response = await api.get('/analytics/overview');
    return response.data?.data ?? response.data;
  },
  getDemographics: async (): Promise<GeographicDemographicsData> => {
    const response = await api.get('/analytics/demographics');
    return response.data?.data ?? response.data;
  },
  getHouseholdsSummary: async (): Promise<HouseholdsSummaryData> => {
    const response = await api.get('/analytics/households-summary');
    return response.data?.data ?? response.data;
  },
  getPnLDeepDive: async (): Promise<PnLDeepDiveData> => {
    await delay();
    return MOCK_PNL_DATA;
  },
  getSupermarketPerformance: async (): Promise<SupermarketPerformanceData> => {
    await delay();
    return mockSupermarketPerformanceData;
  },
  getTokenUsage: async (
    fromTimestamp?: string,
    toTimestamp?: string
  ): Promise<TokenUsageMetrics> => {
    const params = new URLSearchParams();
    if (fromTimestamp) params.append('FromTimestamp', fromTimestamp);
    if (toTimestamp) params.append('ToTimestamp', toTimestamp);

    const url = `/analytics/token-usage${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
  },
};
