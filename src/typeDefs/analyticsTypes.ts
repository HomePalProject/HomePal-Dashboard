export interface CategoryShareData {
  name: string;
  percentage: number;
}

export interface MealPlansSummaryData {
  mealPlansPerHousehold: number;
  mealPlansTotal: number;
}

export interface PreferenceRanking {
  preference: string;
  category: string;
  percentage: number;
}

export interface ShoppingTrendsData {
  mostBoughtCategory?: CategoryShareData;
  mostCommonInventoryCategory?: CategoryShareData;
  mostSuccessfulSupermarket?: string;
  preferenceRanking?: PreferenceRanking[];
}

export interface GenderSplit {
  gender: string;
  percentage: number;
}

export interface UserDemographicsData {
  avgAgeHouseholders: number;
  avgAgeUsers: number;
  genderSplitHouseholders: GenderSplit[];
  genderSplitUsers: GenderSplit[];
}

export interface HouseholdKpis {
  itemsInInventory: number;
  householdMembers: number;
  monthlyBudget: number;
  monthlyExpenses: number;
  monthlyRemaining: number;
  totalGeneratedMealPlans: number;
}

export interface MonthlyExpenseTrend {
  year: number;
  month: number;
  amount: number;
}

export interface CategoryPurchase {
  categoryName: { culture: string; value: string }[] | string;
  purchaseCount: number;
}

export interface SupermarketUsage {
  supermarketName: { culture: string; value: string }[] | string;
  purchaseCount: number;
}

export interface HouseholdOverviewReportData {
  kpis?: HouseholdKpis;
  expensesOverTime?: MonthlyExpenseTrend[];
  mostBoughtCategories?: CategoryPurchase[];
  mostUsedSupermarkets?: SupermarketUsage[];
}

export interface RevenueMonthlyTrend {
  month: string;
  revenue: number;
  transactionsCount: number;
}

export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  currency: string;
  activeSubscribers: number;
  totalTransactions: number;
  successfulTransactions: number;
  monthlyTrend: RevenueMonthlyTrend[];
}
