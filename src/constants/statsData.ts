import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';

export const mockStatsData: AnalyticsOverviewData = {
  revenue: { current: 245800, changePercentage: 12.5 },
  serverCosts: { current: 42100, changePercentage: 3.2 },
  netMargin: { current: 38.4, changePercentage: 1.8 },
  topSupermarketChains: [
    { name: 'Chain A', value: 100 },
    { name: 'Chain B', value: 75 },
    { name: 'Chain C', value: 50 },
    { name: 'Chain D', value: 30 },
    { name: 'Chain E', value: 20 },
  ],
  visionHealth: {
    autoParsedPercentage: 94.2,
    manualFallbackPercentage: 4.5,
    failedPercentage: 1.3,
  },
  userDistribution: [
    { region: 'North', households: 1, lat: 20, lng: 30 },
    { region: 'South', households: 1, lat: 60, lng: 70 },
    { region: 'West', households: 1, lat: 45, lng: 20 },
  ],
  topCategories: [
    { name: 'Fresh Produce', percentage: 32 },
    { name: 'Dairy & Eggs', percentage: 24 },
    { name: 'Meat & Seafood', percentage: 18 },
    { name: 'Pantry Staples', percentage: 15 },
  ],
};
