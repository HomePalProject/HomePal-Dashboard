import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';
import { StatCard } from '@components/stats/StatCard';
import { getLocalString } from '@lib/formatters';

export default function Stats() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, superRes, offersRes] = await Promise.all([
        analyticsService.getOverview().catch(() => null),
        catalogService.getSupermarkets().catch(() => []),
        catalogService.getOffers().catch(() => []),
      ]);
      setData(overviewRes);
      setSupermarkets(superRes);
      setOffers(offersRes);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#6d6862] bg-white rounded-2xl border border-[#e4e0da]">
        Loading analytics overview...
      </div>
    );
  }

  const visionHealth = data?.visionHealth || {
    autoParsedPercentage: 100,
    manualFallbackPercentage: 0,
    failedPercentage: 0,
  };

  const revenue = data?.revenue || { current: 0, changePercentage: 0 };
  const serverCosts = data?.serverCosts || { current: 0, changePercentage: 0 };
  const netMargin = data?.netMargin || { current: 0, changePercentage: 0 };

  const visionTotal =
    (visionHealth.autoParsedPercentage || 0) +
    (visionHealth.manualFallbackPercentage || 0) +
    (visionHealth.failedPercentage || 0);

  const autoDeg =
    visionTotal > 0 ? ((visionHealth.autoParsedPercentage || 0) / visionTotal) * 360 : 360;
  const manualDeg =
    visionTotal > 0 ? ((visionHealth.manualFallbackPercentage || 0) / visionTotal) * 360 : 0;

  // ── Calculate REAL Top Supermarket Chains dynamically from live GET /supermarkets & GET /offers ──
  const calculateRealChains = (): { name: string; value: number }[] => {
    // 1. If backend API endpoint returned non-empty topSupermarketChains, use it
    if (data?.topSupermarketChains && data.topSupermarketChains.length > 0) {
      return data.topSupermarketChains;
    }

    // 2. If no supermarkets registered at all, return empty
    if (supermarkets.length === 0) {
      return [];
    }

    // 3. Compute real share based on actual offers count per supermarket
    const totalOffersCount = offers.length;

    if (totalOffersCount > 0) {
      const computed = supermarkets.map((s) => {
        const nameStr = getLocalString(s.name) || 'Supermarket';
        const sOffers = offers.filter(
          (o) => o.supermarketId === s.id || o.supermarketName === nameStr
        ).length;
        return {
          name: nameStr,
          count: sOffers,
        };
      });

      // Sort by offer count descending
      computed.sort((a, b) => b.count - a.count);

      return computed.map((c) => ({
        name: c.name,
        value: totalOffersCount > 0 ? Math.round((c.count / totalOffersCount) * 100) : 0,
      }));
    }

    // 4. If supermarkets exist but 0 offers created yet, show equal share among registered chains
    const equalShare = Math.floor(100 / supermarkets.length);
    const remainder = 100 - equalShare * supermarkets.length;

    return supermarkets.map((s, idx) => ({
      name: getLocalString(s.name) || 'Supermarket',
      value: equalShare + (idx === 0 ? remainder : 0),
    }));
  };

  const chains = calculateRealChains();

  const categories = data?.topCategories && data.topCategories.length > 0 ? data.topCategories : [];

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2d2a26] tracking-tight m-0">
            Analytics Overview
          </h1>
          <p className="text-xs text-[#6d6862] mt-1 m-0">
            Platform performance and consumer metrics derived from live catalog endpoints.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#356859] hover:bg-[#2a5347] text-white border-none rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
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
          <div className="px-4 py-2 bg-white border border-[#e4e0da] rounded-xl text-xs font-bold text-[#2d2a26] shadow-xs">
            Live Synced
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Revenue (Current Cycle)"
          value={revenue.current}
          change={revenue.changePercentage}
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
          value={serverCosts.current}
          change={serverCosts.changePercentage}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d9534f"
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
          value={netMargin.current}
          change={netMargin.changePercentage}
          isPercent
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d99a3d"
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Top Supermarket Chains (Real Live Catalog Calculation) */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between shadow-xs min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-extrabold text-[#2d2a26] m-0">
                Top Supermarket Chains
              </h2>
              <p className="text-xs text-[#6d6862] m-0 mt-0.5">
                Calculated from live supermarket catalog offers.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/supermarket-performance')}
              className="bg-transparent border-none text-[#356859] text-xs font-bold cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              View All
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {chains.length > 0 ? (
            <div className="flex-1 flex flex-col justify-end">
              {/* Vertical Bar Chart Container */}
              <div className="flex-1 relative min-h-[190px] flex items-end gap-6 px-4 pt-8 pb-3 border-b border-[#e4e0da] bg-[#faf8f3] rounded-xl">
                {/* Background grid lines */}
                <div className="absolute inset-x-4 top-1/4 border-b border-dashed border-[#e4e0da] pointer-events-none" />
                <div className="absolute inset-x-4 top-2/4 border-b border-dashed border-[#e4e0da] pointer-events-none" />
                <div className="absolute inset-x-4 top-3/4 border-b border-dashed border-[#e4e0da] pointer-events-none" />

                {chains.map((chain, i) => {
                  const barColors = [
                    'bg-[#356859]',
                    'bg-[#2a5347]',
                    'bg-[#d99a3d]',
                    'bg-[#6d6862]',
                  ];

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end gap-2 z-10 group h-full"
                    >
                      {/* Percentage Tooltip Badge */}
                      <span className="text-[11px] font-black text-[#2d2a26] bg-white px-2 py-0.5 rounded-md border border-[#e4e0da] shadow-xs mb-1 group-hover:scale-110 transition-transform">
                        {chain.value}%
                      </span>

                      {/* Dynamic Height Bar */}
                      <div
                        className={cn(
                          'w-full max-w-[44px] rounded-t-lg transition-all duration-700 shadow-xs hover:opacity-90',
                          barColors[i % barColors.length]
                        )}
                        style={{ height: `${Math.max(chain.value * 2.2, 35)}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bar Label Names */}
              <div className="flex gap-6 px-4 pt-3">
                {chains.map((chain, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs font-bold text-[#2d2a26] truncate"
                    title={chain.name}
                  >
                    {chain.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf8f3] rounded-xl border border-dashed border-[#e4e0da] text-center space-y-2">
              <span className="text-xs font-bold text-[#6d6862]">
                No partner supermarkets registered yet.
              </span>
              <button
                onClick={() => navigate('/dashboard/supermarket-performance')}
                className="px-3 py-1.5 bg-[#356859] text-white text-xs font-bold rounded-lg border-none cursor-pointer"
              >
                Add Supermarket
              </button>
            </div>
          )}
        </div>

        {/* Vision AI Health */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-base font-extrabold text-[#2d2a26] m-0">
              Receipt Parsing Accuracy
            </h2>
            <button
              onClick={() => navigate('/dashboard/ai-token-usage')}
              className="bg-transparent border-none text-[#356859] text-xs font-bold cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              Logs
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-[#6d6862] mb-6 mt-0">
            Receipt image processing accuracy & fallback rates.
          </p>

          <div className="flex gap-6 items-center">
            {/* Donut Chart via CSS in HomePal Brand Colors */}
            <div
              className="w-28 h-28 rounded-full relative flex items-center justify-center p-3 shrink-0"
              style={{
                background: `conic-gradient(#356859 0deg ${autoDeg}deg, #d99a3d ${autoDeg}deg ${autoDeg + manualDeg}deg, #d9534f ${autoDeg + manualDeg}deg 360deg)`,
              }}
            >
              <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="text-xl font-black text-[#2d2a26]">
                  {(visionHealth.autoParsedPercentage || 100).toFixed(0)}%
                </span>
                <span className="text-[9px] font-bold text-[#6d6862] uppercase tracking-wider">
                  Success
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {[
                {
                  label: 'Auto-Parsed',
                  val: visionHealth.autoParsedPercentage || 100,
                  color: '#356859',
                },
                {
                  label: 'Manual Fallback',
                  val: visionHealth.manualFallbackPercentage || 0,
                  color: '#d99a3d',
                },
                {
                  label: 'Failed',
                  val: visionHealth.failedPercentage || 0,
                  color: '#d9534f',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-[#2d2a26]">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      {item.label}
                    </span>
                    <span className="text-[#2d2a26] font-extrabold">{item.val.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#f4f2ee] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* User Distribution Map */}
        <div
          onClick={() => navigate('/dashboard/geographic-demographics')}
          className="rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md group min-h-[260px] bg-[#356859] text-white"
        >
          {/* Header & Title */}
          <div className="flex justify-between items-center z-10 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d99a3d]" />
                <h2 className="text-base font-extrabold text-white m-0">
                  User Geographic Distribution
                </h2>
              </div>
              <p className="text-xs text-white/80 z-10 mt-0.5 m-0">
                Coverage density across Egypt.
              </p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer flex items-center gap-1.5 transition-colors">
              <span>Explore Map</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Map Vector */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg viewBox="0 0 500 400" className="w-full h-full object-cover">
              <path
                d="M 230 40 L 210 110 L 215 160 L 225 220 L 235 290 L 245 380"
                fill="none"
                stroke="#d99a3d"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              <path
                d="M 80 80 Q 200 70 340 70 L 360 120 L 320 220 L 350 360 L 240 370 L 90 360 Z"
                fill="rgba(255, 255, 255, 0.15)"
                stroke="#d99a3d"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Active Coverage Pins */}
          <div className="relative z-10 my-4 flex-1 min-h-[120px]">
            <div className="absolute top-[35%] left-[45%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-[#d99a3d] border-2 border-white shadow-md" />
              </div>
            </div>

            <div className="absolute top-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-white border-2 border-[#356859] shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Grocery Categories */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-base font-extrabold text-[#2d2a26] m-0 mb-1">
              Top Grocery Categories
            </h2>
            <p className="text-xs text-[#6d6862] m-0 mb-6">
              Household demand distribution by product category.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-col gap-3.5 flex-1 justify-center">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#2d2a26]">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#356859]" />
                      {cat.name}
                    </span>
                    <span className="text-[#356859] font-extrabold">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-[#f4f2ee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#356859] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 bg-[#faf8f3] rounded-xl text-xs text-[#6d6862]">
              No category analytics data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
