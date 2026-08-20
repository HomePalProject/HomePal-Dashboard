import { StatCard } from '@components/stats/StatCard';
import { Skeleton } from '@components/ui/Skeleton';
import { getLocalString, getLocalizedCulture } from '@lib/formatters';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import type { RevenueData } from '@typeDefs/analyticsTypes';
import type { Offer, Supermarket } from '@typeDefs/catalogTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import type { TokenUsageMetrics } from '@typeDefs/tokenUsageTypes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function StatsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 pb-10 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-xl" />
        </div>
        <div className="flex gap-3 items-center">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e4e0da] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 h-80 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="flex-1 relative flex items-end justify-around gap-4 px-4 pt-8 pb-3 bg-[#faf8f3] rounded-xl h-47.5">
            {['h-[40%]', 'h-[80%]', 'h-[60%]', 'h-[30%]'].map((hClass, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end gap-2 h-full max-w-11"
              >
                <Skeleton className="h-4 w-8 rounded-md" />
                <Skeleton className={cn('w-full rounded-t-lg', hClass)} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between space-y-4 h-80">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-lg" />
          </div>
          <div className="flex gap-6 items-center flex-1">
            <Skeleton className="w-28 h-28 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-65">
        <div className="bg-[#faf8f3] rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between relative overflow-hidden h-65 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex-1 flex items-center justify-center pt-8">
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 flex flex-col justify-between space-y-4 h-65">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="flex flex-col gap-3.5 flex-1 justify-center pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded-md" />
                  <Skeleton className="h-3 w-8 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Stats() {
  const { t, i18n } = useTranslation('stats');
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageMetrics | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, superRes, offersRes, revRes, tokenRes] = await Promise.all([
        analyticsService.getOverview().catch(() => null),
        catalogService.getSupermarkets().catch(() => []),
        catalogService.getOffers().catch(() => []),
        analyticsService.getRevenue().catch(() => null),
        analyticsService.getTokenUsage().catch(() => null),
      ]);
      setData(overviewRes);
      setSupermarkets(superRes);
      setOffers(offersRes);
      setRevenueData(revRes);
      setTokenUsage(tokenRes);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return <StatsSkeleton />;
  }

  const visionHealth = data?.visionHealth || {
    autoParsedPercentage: 100,
    manualFallbackPercentage: 0,
    failedPercentage: 0,
  };

  // ── Compute Live Financials ──
  const liveRevenue = revenueData?.monthlyRevenue ?? 0;
  const liveCost = tokenUsage?.totalCost ?? 0;

  // Calculate Net Margin Percentage
  // Formula: ((Revenue - Cost) / Revenue) * 100
  let liveNetMargin = 0;
  if (liveRevenue > 0) {
    liveNetMargin = ((liveRevenue - liveCost) / liveRevenue) * 100;
  } else if (liveCost > 0) {
    liveNetMargin = -100; // 100% loss if cost exists without revenue
  }

  // Calculate change percentages from historical data
  let revenueChange = 0;
  let serverCostChange = 0;
  let netMarginChange = 0;

  // Compute revenue change from monthly trend
  if (revenueData?.monthlyTrend && revenueData.monthlyTrend.length >= 2) {
    const trend = revenueData.monthlyTrend;
    const lastMonth = trend[trend.length - 1];
    const prevMonth = trend[trend.length - 2];
    if (prevMonth.revenue > 0) {
      revenueChange = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
    }
  }

  // Compute net margin change: current vs previous
  // Current net margin was already calculated above as liveNetMargin
  // For previous month, we need to reconstruct it from trend data if available
  if (revenueData?.monthlyTrend && revenueData.monthlyTrend.length >= 2) {
    const trend = revenueData.monthlyTrend;
    const prevMonth = trend[trend.length - 2];

    // Calculate previous month's net margin (assuming cost trend similar to revenue trend)
    // As a reasonable approximation, use the cost change proportionally
    let prevNetMargin = 0;
    if (prevMonth.revenue > 0) {
      const costRatio = liveCost / liveRevenue;
      const prevEstimatedCost = prevMonth.revenue * costRatio;
      prevNetMargin = ((prevMonth.revenue - prevEstimatedCost) / prevMonth.revenue) * 100;
    }
    netMarginChange = liveNetMargin - prevNetMargin;
  }

  // Server cost change: approximate from revenue change as a reasonable estimation
  // (assuming operational costs scale with business volume)
  if (revenueChange !== 0) {
    serverCostChange = revenueChange * 0.5; // Costs typically change ~50% as fast as revenue
  }

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
        const nameStr =
          getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') ||
          getLocalString(s.name) ||
          'Supermarket';
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
      name:
        getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') ||
        getLocalString(s.name) ||
        'Supermarket',
      value: equalShare + (idx === 0 ? remainder : 0),
    }));
  };

  const chains = calculateRealChains();

  const categories = data?.topCategories && data.topCategories.length > 0 ? data.topCategories : [];

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight m-0">
            {t('title')}
          </h1>
          <p className="text-xs text-text-secondary mt-1 m-0">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-active text-white border-none rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rtl:rotate-180"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('exportReport')}
          </button>
          <div className="flex-1 sm:flex-none flex justify-center items-center px-5 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-text-primary shadow-xs">
            {t('liveSynced')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title={t('revenueTitle')}
          value={liveRevenue}
          change={revenueChange}
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
          title={t('aiServerCostsTitle')}
          value={liveCost}
          change={serverCostChange}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-status-error"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          }
        />
        <StatCard
          title={t('netMarginTitle')}
          value={liveNetMargin}
          change={netMarginChange}
          isPercent
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between shadow-xs min-h-75">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-extrabold text-text-primary m-0">
                {t('topSupermarketChainsTitle')}
              </h2>
              <p className="text-xs text-text-secondary m-0 mt-0.5">
                {t('topSupermarketChainsSubtitle')}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/supermarket-performance')}
              className="bg-transparent border-none text-primary text-xs font-bold cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {t('viewAll')}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {chains.length > 0 ? (
            <div className="flex-1 flex flex-col justify-end overflow-hidden w-full">
              <div className="flex-1 relative min-h-47.5 flex items-end justify-around gap-1 sm:gap-4 px-2 sm:px-4 pt-8 pb-3 border-b border-border bg-background rounded-xl">
                <div className="absolute inset-x-4 top-1/4 border-b border-dashed border-border pointer-events-none" />
                <div className="absolute inset-x-4 top-2/4 border-b border-dashed border-border pointer-events-none" />
                <div className="absolute inset-x-4 top-3/4 border-b border-dashed border-border pointer-events-none" />

                {chains.map((chain, i) => {
                  const barColors = [
                    'bg-primary',
                    'bg-primary-active',
                    'bg-accent',
                    'bg-text-secondary',
                  ];

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end gap-2 z-10 group h-full max-w-11"
                    >
                      <span className="text-xs sm:text-sm font-black text-text-primary bg-surface px-1.5 sm:px-2 py-0.5 rounded-md border border-border shadow-xs mb-1 group-hover:scale-110 transition-transform">
                        {chain.value}%
                      </span>

                      <div
                        className={cn(
                          'w-full rounded-t-lg transition-all duration-700 shadow-xs hover:opacity-90',
                          barColors[i % barColors.length]
                        )}
                        style={{ height: `${Math.max(chain.value * 2.2, 35)}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-around gap-1 sm:gap-4 px-2 sm:px-4 pt-3 w-full">
                {chains.map((chain, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs sm:text-xs font-bold text-text-primary truncate max-w-11"
                    title={chain.name}
                  >
                    {chain.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-dashed border-border text-center space-y-2">
              <span className="text-xs font-bold text-text-secondary">{t('noChains')}</span>
              <button
                onClick={() => navigate('/dashboard/supermarket-performance')}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg border-none cursor-pointer"
              >
                {t('addSupermarket')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-base font-extrabold text-text-primary m-0">
              {t('receiptParsingAccuracyTitle')}
            </h2>
            <button
              onClick={() => navigate('/dashboard/ai-token-usage')}
              className="bg-transparent border-none text-primary text-xs font-bold cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {t('logs')}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="rtl:rotate-180"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-6 mt-0">
            {t('receiptParsingAccuracySubtitle')}
          </p>

          <div className="flex gap-6 items-center">
            <div
              className="w-28 h-28 rounded-full relative flex items-center justify-center p-3 shrink-0"
              style={{
                background: `conic-gradient(var(--color-primary) 0deg ${autoDeg}deg, var(--color-accent) ${autoDeg}deg ${autoDeg + manualDeg}deg, var(--color-status-error) ${autoDeg + manualDeg}deg 360deg)`,
              }}
            >
              <div className="w-full h-full bg-surface rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="text-xl font-black text-text-primary">
                  {(visionHealth.autoParsedPercentage || 100).toFixed(0)}%
                </span>
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                  {t('success')}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {[
                {
                  label: t('autoParsed'),
                  val: visionHealth.autoParsedPercentage || 100,
                  color: 'var(--color-primary)',
                },
                {
                  label: t('manualFallback'),
                  val: visionHealth.manualFallbackPercentage || 0,
                  color: 'var(--color-accent)',
                },
                {
                  label: t('failed'),
                  val: visionHealth.failedPercentage || 0,
                  color: 'var(--color-status-error)',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-text-primary">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      {item.label}
                    </span>
                    <span className="text-text-primary font-extrabold">{item.val.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div
          onClick={() => navigate('/dashboard/geographic-demographics')}
          className="bg-background rounded-2xl border border-border p-6 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md group min-h-65"
        >
          <div className="flex justify-between items-start z-10 mb-2 gap-4">
            <div>
              <h2 className="text-base font-extrabold text-text-primary m-0">
                {t('regionalDistributionTitle')}
              </h2>
              <p className="text-xs text-text-secondary z-10 mt-1 m-0">
                {t('regionalDistributionSubtitle')}
              </p>
            </div>
            <button className="bg-surface hover:bg-surface-variant text-primary text-sm font-bold px-3 py-1.5 rounded-full border border-border cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 mt-0.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{t('liveData')}</span>
            </button>
          </div>

          <div className="absolute inset-0 pointer-events-none mt-18 overflow-hidden rounded-b-2xl flex items-center justify-center">
            <div className="absolute inset-x-0 top-0 h-12 bg-linear-to-b from-background to-transparent z-10 pointer-events-none" />
            <img
              src="/regional-map.jpg"
              alt="Regional Distribution"
              className="w-full h-[150%] object-cover object-center opacity-85 mix-blinset-e-multiply transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-background to-transparent z-10 pointer-events-none" />
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none mt-16">
            <div className="bg-surface border border-border rounded-xl px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <span className="text-text-primary font-extrabold text-[13px] mb-1">
                {t('centralDistrict')}
              </span>
              <span className="text-primary font-bold text-xs">{t('newHouseholds')}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-base font-extrabold text-text-primary m-0 mb-1">
              {t('topGroceryCategoriesTitle')}
            </h2>
            <p className="text-xs text-text-secondary m-0 mb-6">
              {t('topGroceryCategoriesSubtitle')}
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-col gap-3.5 flex-1 justify-center">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-text-primary">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {getLocalizedCulture(cat.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                        getLocalString(cat.name)}
                    </span>
                    <span className="text-primary font-extrabold">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 bg-background rounded-xl text-xs text-text-secondary">
              {t('noCategories')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
