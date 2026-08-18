import type { SupermarketPerformanceData } from '@typeDefs/supermarketTypes';

export const mockSupermarketPerformanceData: SupermarketPerformanceData = {
  partners: [
    {
      id: '1',
      rank: 1,
      code: 'SP',
      chain: 'Spinneys',
      activeOffers: '1,245',
      userCtr: '8.4%',
      ingestionRate: { value: '99.8%', color: '#10b981', bg: '#d1fae5' },
      predictedGrowth: '+12%',
    },
    {
      id: '2',
      rank: 2,
      code: 'CA',
      chain: 'Carrefour',
      activeOffers: '3,102',
      userCtr: '7.1%',
      ingestionRate: { value: '98.5%', color: '#10b981', bg: '#d1fae5' },
      predictedGrowth: '+8%',
    },
    {
      id: '3',
      rank: 3,
      code: 'LC',
      chain: 'Lulu Hypermarket',
      activeOffers: '890',
      userCtr: '5.2%',
      ingestionRate: { value: '92.1%', color: '#f59e0b', bg: '#fef3c7' },
      predictedGrowth: '+2%',
    },
  ],
  opportunities: {
    waitrose: { coverage: '42%', potential: 'High Potential' },
    choithrams: { errors: '12%', potential: 'Med Potential' },
  },
  funnel: {
    flyerSeen: '142K',
    productSaved: '64K',
    purchaseLogged: '25K',
    conversionRate: '17.6%',
  },
};

export const BRANCH_COUNTS: Record<string, number> = {
  'Carrefour Egypt': 69,
  'Spinneys Egypt': 35,
  'Metro Market': 48,
  Kazyon: 450,
  'Seoudi Market': 21,
  'Lulu Hypermarket': 4,
  'BIM Egypt': 300,
  'Abdullah AlOthaim': 61,
  'Awlad Ragab': 75,
  'Gomla Market': 12,
};
