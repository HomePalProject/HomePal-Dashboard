import { MOCK_HOUSEHOLDS_DATA } from '@constants/householdsData';
import { getErrorMessage } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import { useCallback, useEffect, useState } from 'react';

export default function Households() {
  const [data, setData] = useState<HouseholdsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await analyticsService.getHouseholdsSummary();
      setData(result || MOCK_HOUSEHOLDS_DATA);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      // Fallback to mock data
      setData(MOCK_HOUSEHOLDS_DATA);
    }
  }, []);

  useEffect(() => {
    fetchData().then(() => setLoading(false));
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="p-40 text-text-disabled font-sans">Loading aggregated household data...</div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-24 pb-15 font-sans">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-[8px] mb-[8px] flex-wrap">
          <h1 className="text-22 sm:text-28 font-extrabold text-text-primary tracking-tight m-0">
            Households Analytics
          </h1>
          <span className="bg-primary-container text-primary text-[11px] font-bold px-[8px] py-[4px] rounded-full uppercase tracking-wider">
            Privacy Safe
          </span>
        </div>
        <p className="text-typography-bodysmall text-text-secondary max-w-150 m-0">
          Aggregated platform metrics. Personally Identifiable Information (PII) is intentionally
          restricted from this dashboard to ensure data privacy.
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-status-error bg-status-error-container rounded-sm border border-status-error/20">
          {error} (Showing fallback data)
        </div>
      )}

      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20">
        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <div className="text-13 font-semibold text-text-disabled mb-[8px]">Total Registered</div>
          <div className="text-32 font-extrabold text-text-primary">
            {data.totalHouseholds.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-primary mt-[4px]">{data.growthRate} YoY</div>
        </div>

        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <div className="text-13 font-semibold text-text-disabled mb-[8px]">Active This Month</div>
          <div className="text-32 font-extrabold text-text-primary">
            {data.activeHouseholds.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">
            94% Activity Rate
          </div>
        </div>

        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <div className="text-13 font-semibold text-text-disabled mb-[8px]">
            Avg Household Size
          </div>
          <div className="text-32 font-extrabold text-text-primary">{data.avgHouseholdSize}</div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">
            Members / Household
          </div>
        </div>

        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <div className="text-13 font-semibold text-text-disabled mb-[8px]">
            Avg Monthly Income
          </div>
          <div className="text-32 font-extrabold text-text-primary">{data.avgHouseholdIncome}</div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">Self-reported</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
        {/* ── Top Regions ── */}
        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <h2 className="text-base font-bold text-text-primary mb-24">Adoption by Region</h2>

          <div className="flex flex-col gap-20">
            {data.topRegions.map((region, i) => (
              <div key={i}>
                <div className="flex justify-between text-13 font-semibold text-text-primary mb-[8px]">
                  <span>{region.name}</span>
                  <span className="text-text-secondary">
                    {region.count.toLocaleString()} ({region.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-surface-variant rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-sm transition-all duration-500 ease-out"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Size Distribution ── */}
        <div className="bg-surface p-24 rounded-md border border-border shadow-sm">
          <h2 className="text-base font-bold text-text-primary mb-24">
            Household Size Demographics
          </h2>

          <div className="flex flex-col gap-20">
            {data.sizeDistribution.map((item, i) => {
              const max = Math.max(...data.sizeDistribution.map((d) => d.count));
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-13 font-semibold text-text-primary mb-[8px]">
                    <span>{item.size}</span>
                    <span className="text-text-secondary">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-sm transition-all duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
