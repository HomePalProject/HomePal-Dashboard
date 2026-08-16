import { useEffect, useState } from 'react';
import { analyticsService } from '@services/analyticsService';
import type { TokenUsageMetrics } from '@typeDefs/tokenUsageTypes';
import { MetricCard } from '@components/dashboard/MetricCard';

export default function TokenUsage() {
  const [data, setData] = useState<TokenUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple date range states (could be replaced with a real date picker)
  const [days, setDays] = useState(7);

  useEffect(() => {
    let mounted = true;
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const toTimestamp = new Date().toISOString();
        const fromTimestamp = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const res = await analyticsService.getTokenUsage(fromTimestamp, toTimestamp);
        if (mounted) setData(res);
      } catch (error) {
        console.error('Failed to fetch token usage:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUsage();
    return () => {
      mounted = false;
    };
  }, [days]);

  if (loading || !data) {
    return <div className="p-40 text-text-secondary font-sans">Loading token usage metrics...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-24 pb-15 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-20">
        <div>
          <div className="flex items-center gap-1.5 text-13 text-text-secondary mb-[8px] font-medium">
            <span>Analytics</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-text-primary">AI Token Usage</span>
          </div>
          <h1 className="text-22 sm:text-28 font-extrabold text-text-primary tracking-tight mb-[8px] m-0">
            Token Usage & Cost
          </h1>
          <p className="text-sm text-text-secondary max-w-150 leading-relaxed m-0">
            Monitor API consumption and costs from OpenAI for our flyer extraction pipeline.
          </p>
        </div>

        <div className="flex gap-12 sm:mt-0 flex-wrap items-center">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-12 py-2.5 rounded-lg border border-border text-13 text-text-primary bg-white outline-none cursor-pointer focus:border-primary transition-colors shadow-sm"
          >
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
        <MetricCard
          label="Total Tokens"
          value={(data.totalTokens ?? 0).toLocaleString()}
          note="Input + Output"
          icon="⚡"
        />
        <MetricCard
          label="Input Tokens"
          value={(data.inputTokens ?? 0).toLocaleString()}
          note="Prompt Context"
          icon="📥"
        />
        <MetricCard
          label="Output Tokens"
          value={(data.outputTokens ?? 0).toLocaleString()}
          note="Model Generation"
          icon="📤"
        />
        <MetricCard
          label="Total Cost"
          value={`$${(data.totalCost ?? 0).toFixed(2)}`}
          note="Estimated API Spend"
          icon="💸"
        />
      </div>

      <div className="bg-white rounded-xl border border-border p-24 shadow-sm mt-8">
        <div className="flex items-center gap-8 mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <h2 className="text-base font-bold text-text-primary m-0">Usage Insight</h2>
        </div>
        <p className="text-14 text-text-secondary leading-relaxed m-0 max-w-3xl">
          This data reflects usage for the selected time period. Monitoring these numbers closely
          helps ensure our parsing engine remains cost-effective as we scale supermarket coverage.
        </p>
      </div>
    </div>
  );
}
