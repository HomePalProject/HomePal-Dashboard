export interface BillingLedgerRow {
  id: string;
  provider: string;
  providerIcon: string;
  category: string;
  usage: string;
  cost: string;
  status: 'PAID' | 'PENDING';
}

export interface PnLDeepDiveData {
  mrr: { value: string; change: string };
  aiCosts: { value: string; overage: string };
  netMargin: { value: string };
  cac: { value: string; target: string };
  chartData: { revenue: number[]; costs: number[] };
  billingLedger: BillingLedgerRow[];
}
