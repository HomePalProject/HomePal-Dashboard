export interface HouseholdsSummaryData {
  totalHouseholds: number;
  activeHouseholds: number;
  avgHouseholdSize: number;
  avgHouseholdIncome: string;
  growthRate: string;
  topRegions: { name: string; count: number; percentage: number }[];
  sizeDistribution: { size: string; count: number }[];
}
