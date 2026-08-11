import { PnLDeepDiveData } from '@typeDefs/pnlTypes';

export const MOCK_PNL_DATA: PnLDeepDiveData = {
  mrr: { value: '$1.24M', change: '+12.4%' },
  aiCosts: { value: '$248K', overage: '+5.2% Overage' },
  netMargin: { value: '28.4%' },
  cac: { value: '$412.00', target: '$450' },
  chartData: {
    revenue: [20, 25, 32, 45, 55, 62, 70, 80, 95, 110, 120, 130],
    costs: [10, 12, 14, 18, 22, 30, 32, 28, 25, 20, 50, 45], // Spline path estimation
  },
  billingLedger: [
    {
      id: '1',
      provider: 'OpenAI API',
      providerIcon: 'openai',
      category: 'LLM Inference',
      usage: '42.5M Tokens',
      cost: '$8,450.00',
      status: 'PAID',
    },
    {
      id: '2',
      provider: 'AWS Compute',
      providerIcon: 'aws',
      category: 'EC2 Instances',
      usage: '1,240 Hours',
      cost: '$3,120.50',
      status: 'PAID',
    },
    {
      id: '3',
      provider: 'Pinecone DB',
      providerIcon: 'pinecone',
      category: 'Vector Storage',
      usage: '200GB (Overage)',
      cost: '$1,450.00',
      status: 'PENDING',
    },
  ],
};
