import type { GeographicDemographicsData } from '@typeDefs/demographicsTypes';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { TokenUsageMetrics } from '@typeDefs/tokenUsageTypes';
import type {
  MealPlansSummaryData,
  ShoppingTrendsData,
  UserDemographicsData,
  HouseholdOverviewReportData,
  RevenueData,
} from '@typeDefs/analyticsTypes';
import { api } from './api';

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
  getMealPlansSummary: async (): Promise<MealPlansSummaryData> => {
    const response = await api.get('/analytics/meal-plans-summary');
    return response.data?.data ?? response.data;
  },
  getShoppingTrends: async (): Promise<ShoppingTrendsData> => {
    const response = await api.get('/analytics/shopping-trends');
    return response.data?.data ?? response.data;
  },
  getUserDemographics: async (): Promise<UserDemographicsData> => {
    const response = await api.get('/analytics/user-demographics');
    return response.data?.data ?? response.data;
  },
  getHouseholdOverviewReport: async (): Promise<HouseholdOverviewReportData> => {
    const response = await api.get('/reports/household-overview');
    return response.data?.data ?? response.data;
  },
  getRevenue: async (): Promise<RevenueData> => {
    const response = await api.get('/analytics/revenue');
    return response.data?.data ?? response.data;
  },
  getSupermarketPerformance: async (): Promise<ShoppingTrendsData> => {
    const response = await api.get('/analytics/shopping-trends');
    return response.data?.data ?? response.data;
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
