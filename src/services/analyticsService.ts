import api from './api';
import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { PnLDeepDiveData } from '@typeDefs/pnlTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { SupermarketPerformanceData } from '@typeDefs/supermarketTypes';
import type { VisionLogsData } from '@typeDefs/visionAITypes';

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverviewData> => {
    const response = await api.get('/api/analytics/overview');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  getDemographics: async (): Promise<GeographicDemographicsData> => {
    const response = await api.get('/api/analytics/demographics');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  getHouseholdsSummary: async (): Promise<HouseholdsSummaryData> => {
    const response = await api.get('/api/analytics/households-summary');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  getPnLDeepDive: async (): Promise<PnLDeepDiveData> => {
    const response = await api.get('/api/analytics/pnl-deep-dive');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  getSupermarketPerformance: async (): Promise<SupermarketPerformanceData> => {
    const response = await api.get('/api/analytics/supermarket-performance');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  getVisionLogs: async (): Promise<VisionLogsData> => {
    const response = await api.get('/api/analytics/vision-logs');
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
};
