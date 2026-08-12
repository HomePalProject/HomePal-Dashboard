import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import { mockStatsData } from '@constants/statsData';
import { StatCard } from '@components/stats/StatCard';

// ── Components ───────────────────────────────────────────────────────────────

export default function Stats() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setData(res);
    } catch {
      setData(mockStatsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return <div className="p-40 text-text-secondary font-sans">Loading analytics...</div>;
  }

  const visionTotal =
    data.visionHealth.autoParsedPercentage +
    data.visionHealth.manualFallbackPercentage +
    data.visionHealth.failedPercentage;
  const autoDeg = (data.visionHealth.autoParsedPercentage / visionTotal) * 360;
  const manualDeg = (data.visionHealth.manualFallbackPercentage / visionTotal) * 360;

  return (
    <div className="max-w-300 mx-auto flex flex-col gap-24 font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-28 font-extrabold text-text-primary tracking-tight mb-[8px] m-0">
            Analytics Overview
          </h1>
          <p className="text-sm text-text-secondary max-w-150 m-0">
            Platform performance and insights for current billing cycle.
          </p>
        </div>
        <div className="flex gap-12 flex-wrap">
          <button className="flex items-center gap-[8px] px-16 py-2.5 bg-primary text-white border-none rounded-lg text-13 font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
          <div className="px-16 py-2.5 bg-surface border border-border rounded-lg text-13 font-semibold text-text-primary">
            Last 30 Days
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
        <StatCard
          title="Revenue (Current Cycle)"
          value={data.revenue.current}
          change={data.revenue.changePercentage}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
          onClick={() => navigate('/dashboard/pnl-deep-dive')}
        />
        <StatCard
          title="AI Server Costs"
          value={data.serverCosts.current}
          change={data.serverCosts.changePercentage}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--sys-status-error)"
              strokeWidth="2"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          }
        />
        <StatCard
          title="Net Margin"
          value={data.netMargin.current}
          change={data.netMargin.changePercentage}
          isPercent
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          }
        />
      </div>

      {/* ── Middle Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20">
        {/* Top Supermarket Chains */}
        <div className="bg-surface rounded-xl border border-border p-24 flex flex-col">
          <div className="flex justify-between items-center mb-24">
            <h2 className="text-base font-bold text-text-primary m-0">Top Supermarket Chains</h2>
            <button
              onClick={() => navigate('/dashboard/supermarket-performance')}
              className="bg-transparent border-none text-primary text-xs font-bold cursor-pointer flex items-center gap-[4px] hover:opacity-80 transition-opacity"
            >
              View All
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 relative min-h-45 flex items-end gap-24 px-20 border-b border-border">
            {/* Background grid lines */}
            <div className="absolute inset-0 border-t border-b border-[#f0f0f0] top-[4px]/3 h-[4px]/3" />

            {data.topSupermarketChains.map((chain, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-12 z-10">
                <div
                  className={cn(
                    'w-full max-w-40 rounded-t-sm',
                    i === 0 ? 'bg-primary opacity-100' : 'bg-[#e4e4e7] opacity-60'
                  )}
                  style={{ height: `${(chain.value / 100) * 140}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-24 px-20 pt-12">
            {data.topSupermarketChains.map((chain, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[11px] font-semibold text-text-primary"
              >
                {chain.name}
              </div>
            ))}
          </div>
        </div>

        {/* Vision AI Health */}
        <div className="bg-surface rounded-xl border border-border p-24">
          <div className="flex justify-between items-start mb-[4px]">
            <h2 className="text-base font-bold text-text-primary m-0">Vision AI Health</h2>
            <button
              onClick={() => navigate('/dashboard/vision-ai-logs')}
              className="bg-transparent border-none text-primary text-xs font-bold cursor-pointer flex items-center gap-[4px] hover:opacity-80 transition-opacity"
            >
              View Logs
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-8 mt-0">
            Receipt parsing accuracy & fallback rates.
          </p>

          <div className="flex gap-8 items-center">
            {/* Donut Chart via CSS */}
            <div
              className="w-30 h-30 rounded-full relative flex items-center justify-center p-12"
              style={{
                background: `conic-gradient(var(--sys-primary) 0deg ${autoDeg}deg, #d97706 ${autoDeg}deg ${autoDeg + manualDeg}deg, var(--sys-status-error) ${autoDeg + manualDeg}deg 360deg)`,
              }}
            >
              <div className="w-full h-full bg-surface rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-text-primary">
                  {Math.round(data.visionHealth.autoParsedPercentage)}%
                </span>
                <span className="text-[10px] font-semibold text-text-secondary uppercase">
                  Success
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {[
                {
                  label: 'Auto-Parsed',
                  val: data.visionHealth.autoParsedPercentage,
                  color: 'var(--sys-primary)',
                },
                {
                  label: 'Manual Fallback',
                  val: data.visionHealth.manualFallbackPercentage,
                  color: '#d97706',
                },
                {
                  label: 'Failed',
                  val: data.visionHealth.failedPercentage,
                  color: 'var(--sys-status-error)',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5 text-text-primary">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      {item.label}
                    </span>
                    <span>{item.val.toFixed(1)}%</span>
                  </div>
                  <div className="h-[4px] bg-[#f4f4f5] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${item.val}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 flex-1">
        {/* User Distribution Map */}
        <div
          onClick={() => navigate('/dashboard/geographic-demographics')}
          className="bg-[#e9f1eb] rounded-xl border border-border p-24 flex flex-col relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] group"
        >
          <div className="flex justify-between items-center z-10 mb-[4px]">
            <h2 className="text-base font-bold text-text-primary m-0">User Distribution</h2>
            <button className="bg-transparent border-none text-primary text-xs font-bold cursor-pointer flex items-center gap-[4px]">
              View Map
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-secondary z-10 mt-0">Active households by region.</p>

          {/* Abstract map representation */}
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M20,80 Q40,40 60,70 T90,20 L100,100 L0,100 Z" fill="#d1e0d7" opacity="0.5" />
              <path d="M10,90 Q30,60 50,80 T80,30 L100,100 L0,100 Z" fill="#d1e0d7" opacity="0.3" />
            </svg>
          </div>
          {data.userDistribution.map((pt, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 bg-primary rounded-full border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pt.lng}%`,
                top: `${pt.lat}%`,
              }}
            />
          ))}
        </div>

        {/* Top Grocery Categories */}
        <div className="bg-surface rounded-xl border border-border p-24 flex flex-col">
          <h2 className="text-base font-bold text-text-primary m-0 mb-24">
            Top Grocery Categories
          </h2>
          <div className="flex flex-col gap-24 flex-1 justify-center">
            {data.topCategories.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-13 font-semibold text-text-primary mb-[8px]">
                  <span className="flex items-center gap-[8px]">
                    {i === 0 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                      </svg>
                    )}
                    {i === 1 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10" />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      </svg>
                    )}
                    {i === 3 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <circle cx="12" cy="14" r="4" />
                        <line x1="12" y1="6" x2="12.01" y2="6" />
                      </svg>
                    )}
                    {cat.name}
                  </span>
                  <span className="text-text-secondary">{cat.percentage}%</span>
                </div>
                <div className="h-1.5 bg-[#f4f4f5] rounded-[3px] overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-[3px]"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
