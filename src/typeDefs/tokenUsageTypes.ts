export interface TokenUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number;
  fromTimestamp?: string;
  toTimestamp?: string;
}
