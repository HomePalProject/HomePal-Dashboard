import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';

export const MOCK_HOUSEHOLDS_DATA: HouseholdsSummaryData = {
  totalHouseholds: 12450,
  activeHouseholds: 11800,
  avgHouseholdSize: 3.4,
  avgHouseholdIncome: '$4,250',
  growthRate: '+12.4%',
  topRegions: [
    { name: 'New Cairo', count: 4200, percentage: 35 },
    { name: 'Sheikh Zayed', count: 3100, percentage: 26 },
    { name: 'Nasr City', count: 2400, percentage: 20 },
    { name: 'Heliopolis', count: 1800, percentage: 15 },
    { name: 'Others', count: 300, percentage: 4 },
  ],
  sizeDistribution: [
    { size: '1 Person', count: 1800 },
    { size: '2 People', count: 3500 },
    { size: '3-4 People', count: 5200 },
    { size: '5+ People', count: 1300 },
  ],
};
