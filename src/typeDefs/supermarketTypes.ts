export interface SupermarketPartner {
  id: string;
  rank: number;
  chain: string;
  code: string;
  activeOffers: string;
  userCtr: string;
  ingestionRate: { value: string; color: string; bg: string };
  predictedGrowth: string;
}

export interface SupermarketPerformanceData {
  partners: SupermarketPartner[];
  opportunities: {
    waitrose: { coverage: string; potential: string };
    choithrams: { errors: string; potential: string };
  };
  funnel: {
    flyerSeen: string;
    productSaved: string;
    purchaseLogged: string;
    conversionRate: string;
  };
}
