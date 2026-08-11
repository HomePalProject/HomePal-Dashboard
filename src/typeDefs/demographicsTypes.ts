export interface DistrictData {
  id: string;
  name: string;
  growth: string;
  hhDensity: string;
  avgIncome: string;
  pop: string;
  intensity: number;
  lat: number;
  lng: number;
  radius: number;
}

export interface GeographicDemographicsData {
  districts: DistrictData[];
  budget: { value: string; change: string; region: string };
  topCategories: { name: string; percentage: number }[];
  householdSize: { size: string; value: number }[];
}
