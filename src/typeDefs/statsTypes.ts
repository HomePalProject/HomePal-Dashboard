export interface AnalyticsOverviewData {
  revenue: { current: number; changePercentage: number };
  serverCosts: { current: number; changePercentage: number };
  netMargin: { current: number; changePercentage: number };
  topSupermarketChains: { name: string; value: number }[];
  visionHealth: {
    autoParsedPercentage: number;
    manualFallbackPercentage: number;
    failedPercentage: number;
  };
  userDistribution: { region: string; households: number; lat: number; lng: number }[];
  topCategories: { name: string; percentage: number }[];
}
