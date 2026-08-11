import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { PnLDeepDiveData } from '@typeDefs/pnlTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { SupermarketPerformanceData } from '@typeDefs/supermarketTypes';
import type { VisionLogsData } from '@typeDefs/visionAITypes';

// Import fallback constants
import { mockStatsData } from '@constants/statsData';
import { MOCK_DEMOGRAPHICS_DATA } from '@constants/demographicsData';
import { MOCK_HOUSEHOLDS_DATA } from '@constants/householdsData';
import { MOCK_PNL_DATA } from '@constants/pnlData';
import { mockSupermarketPerformanceData } from '@constants/supermarketData';
import { fallbackVisionLogsData } from '@constants/visionAIData';

// Simulated network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverviewData> => {
    await delay();
    return mockStatsData;
  },
  getDemographics: async (): Promise<GeographicDemographicsData> => {
    await delay();
    return MOCK_DEMOGRAPHICS_DATA;
  },
  getHouseholdsSummary: async (): Promise<HouseholdsSummaryData> => {
    await delay();
    return MOCK_HOUSEHOLDS_DATA;
  },
  getPnLDeepDive: async (): Promise<PnLDeepDiveData> => {
    await delay();
    return MOCK_PNL_DATA;
  },
  getSupermarketPerformance: async (): Promise<SupermarketPerformanceData> => {
    await delay();
    return mockSupermarketPerformanceData;
  },
  getVisionLogs: async (): Promise<VisionLogsData> => {
    await delay();
    return fallbackVisionLogsData;
  },
};
