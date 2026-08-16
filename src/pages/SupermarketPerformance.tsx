import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import { getImageUrl, getLocalString } from '@lib/formatters';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';
import type { ShoppingTrendsData } from '@typeDefs/analyticsTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';

function SupermarketLogo({
  logoPath,
  name,
  className = 'w-[36px] h-[36px]',
}: {
  logoPath?: string | null;
  name: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const fullUrl = getImageUrl(logoPath);

  if (fullUrl && !imgError) {
    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden bg-white border border-border shrink-0 flex items-center justify-center p-0',
          className
        )}
      >
        <img
          src={fullUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'SM';

  return (
    <div
      className={cn(
        'rounded-lg bg-primary/10 text-primary font-extrabold text-[12px] border border-primary/20 flex items-center justify-center shrink-0',
        className
      )}
    >
      {initials}
    </div>
  );
}

export default function SupermarketPerformance() {
  const navigate = useNavigate();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shoppingTrends, setShoppingTrends] = useState<ShoppingTrendsData | null>(null);
  const [overviewData, setOverviewData] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [supermarketsRes, offersRes, trendsRes, overviewRes] = await Promise.all([
        catalogService.getSupermarkets().catch(() => []),
        catalogService.getOffers().catch(() => []),
        analyticsService.getShoppingTrends().catch(() => null),
        analyticsService.getOverview().catch(() => null),
      ]);

      setSupermarkets(supermarketsRes);
      setOffers(offersRes);
      setShoppingTrends(trendsRes);
      setOverviewData(overviewRes);
    } catch (err) {
      console.error('Error loading supermarket analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 600));

    const headers = ['Supermarket Name', 'Website', 'Offers Count', 'Status'];
    const rows = supermarkets.map((s) => {
      const name = getLocalString(s.name);
      const sOffers = offers.filter(
        (o) => o.supermarketId === s.id || o.supermarketName === name
      ).length;
      return [
        `"${name}"`,
        `"${s.websiteUrl || '—'}"`,
        sOffers,
        s.isActive !== false ? 'Active' : 'Inactive',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'supermarkets_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    showToast('Supermarket performance report exported successfully');
  };

  const filteredSupermarkets = supermarkets.filter((s) => {
    const name = getLocalString(s.name).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="p-[40px] text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-[32px] h-[32px] border-4 border-primary border-t-transparent rounded-full animate-spin mb-[16px]" />
        <span className="text-[14px] font-medium text-text-secondary">
          Loading live supermarket analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[20px] pb-[16px] font-sans relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-[12px]">
        <div>
          <div className="flex items-center gap-[6px] text-[13px] text-text-secondary mb-[4px] font-medium">
            <span>HomePal Admin</span>
            <svg
              className="w-[12px] h-[12px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-text-primary">Analytics</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-text-primary tracking-tight m-0">
            Supermarket Performance & Trends
          </h1>
          <p className="text-[13px] text-text-secondary m-0 mt-[2px]">
            Live partner supermarket operations, active catalog offers, and consumer preference
            trends.
          </p>
        </div>
        <div className="flex gap-[10px] items-center flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-[6px] px-[14px] py-[8px] bg-surface border border-border rounded-lg text-[13px] font-semibold text-text-primary transition-all shadow-xs hover:bg-surface-variant cursor-pointer',
              isExporting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <div className="w-[14px] h-[14px] border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-[15px] h-[15px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            Export CSV
          </button>
          <button
            onClick={() => navigate('/dashboard/supermarkets?openAdd=true')}
            className="flex items-center gap-[6px] px-[14px] py-[8px] bg-primary text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-90 shadow-xs"
          >
            <svg
              className="w-[15px] h-[15px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Partner
          </button>
        </div>
      </div>

      {/* ── KPI Cards Section ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {/* Card 1: Top Supermarket Partner */}
        <div className="bg-surface rounded-xl border border-border p-[16px] sm:p-[20px] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-[13px] font-semibold text-text-secondary">
              Top Supermarket Partner
            </span>
            <div className="w-[36px] h-[36px] rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] font-bold text-text-primary tracking-tight">
            {shoppingTrends?.mostSuccessfulSupermarket || 'Carrefour'}
          </div>
          <div className="text-[12px] text-primary font-medium mt-[4px]">
            Highest consumer engagement
          </div>
        </div>

        {/* Card 2: Most Purchased Category */}
        <div className="bg-surface rounded-xl border border-border p-[16px] sm:p-[20px] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-[13px] font-semibold text-text-secondary">
              Top Purchased Category
            </span>
            <div className="w-[36px] h-[36px] rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] font-bold text-text-primary tracking-tight truncate">
            {shoppingTrends?.mostBoughtCategory?.name || 'Dairy & Eggs'}
          </div>
          <div className="text-[12px] text-emerald-600 font-semibold mt-[4px]">
            {shoppingTrends?.mostBoughtCategory?.percentage
              ? `${shoppingTrends.mostBoughtCategory.percentage}% of purchases`
              : 'High volume demand'}
          </div>
        </div>

        {/* Card 3: Top Inventory Category */}
        <div className="bg-surface rounded-xl border border-border p-[16px] sm:p-[20px] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-[13px] font-semibold text-text-secondary">
              Top Inventory Category
            </span>
            <div className="w-[36px] h-[36px] rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] font-bold text-text-primary tracking-tight truncate">
            {shoppingTrends?.mostCommonInventoryCategory?.name || 'Beverages'}
          </div>
          <div className="text-[12px] text-amber-600 font-semibold mt-[4px]">
            {shoppingTrends?.mostCommonInventoryCategory?.percentage
              ? `${shoppingTrends.mostCommonInventoryCategory.percentage}% of total stock`
              : 'Most stocked'}
          </div>
        </div>

        {/* Card 4: Total Active Offers */}
        <div className="bg-surface rounded-xl border border-border p-[16px] sm:p-[20px] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-[8px]">
            <span className="text-[13px] font-semibold text-text-secondary">
              Active Offers Catalog
            </span>
            <div className="w-[36px] h-[36px] rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
          </div>
          <div className="text-[20px] font-bold text-text-primary tracking-tight">
            {offers.length.toLocaleString()} Active
          </div>
          <div className="text-[12px] text-indigo-600 font-semibold mt-[4px]">
            Verified partner deals
          </div>
        </div>
      </div>

      {/* ── Main Section Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[20px] items-start">
        {/* Partner Supermarkets Table */}
        <div className="bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-xs">
          <div className="px-[20px] py-[14px] border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-[10px]">
            <div className="flex items-center gap-[8px]">
              <h2 className="text-[15px] font-bold text-text-primary m-0">Partner Supermarkets</h2>
              <span className="px-[8px] py-[2px] rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {supermarkets.length} Enrolled
              </span>
            </div>
            <div className="relative w-full sm:w-[220px]">
              <input
                type="text"
                placeholder="Search partner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-[10px] py-[6px] pl-[30px] text-[13px] bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary h-[34px]"
              />
              <svg
                className="w-[14px] h-[14px] absolute left-[10px] top-1/2 -translate-y-1/2 text-text-disabled"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-variant/30">
                  <th className="px-[16px] py-[10px] text-[11px] font-semibold text-text-secondary uppercase">
                    Supermarket Partner
                  </th>
                  <th className="px-[16px] py-[10px] text-[11px] font-semibold text-text-secondary uppercase">
                    Website
                  </th>
                  <th className="px-[16px] py-[10px] text-[11px] font-semibold text-text-secondary uppercase">
                    Active Offers
                  </th>
                  <th className="px-[16px] py-[10px] text-[11px] font-semibold text-text-secondary uppercase text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSupermarkets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-[20px] py-[32px] text-center text-text-disabled text-[13px]"
                    >
                      No matching supermarkets found.
                    </td>
                  </tr>
                ) : (
                  filteredSupermarkets.map((supermarket) => {
                    const name = getLocalString(supermarket.name);
                    const sOffersCount = offers.filter(
                      (o) => o.supermarketId === supermarket.id || o.supermarketName === name
                    ).length;

                    return (
                      <tr
                        key={supermarket.id}
                        className="border-b border-border transition-colors hover:bg-surface-variant/40"
                      >
                        <td className="px-[16px] py-[12px]">
                          <div className="flex items-center gap-[10px]">
                            <SupermarketLogo
                              logoPath={supermarket.logoPath}
                              name={name}
                              className="w-[36px] h-[36px]"
                            />
                            <div>
                              <div className="text-[13px] font-semibold text-text-primary">
                                {name}
                              </div>
                              <div className="text-[11px] text-text-disabled">
                                {supermarket.address || 'Partner Chain'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-[16px] py-[12px] text-[13px] text-text-secondary">
                          {supermarket.websiteUrl ? (
                            <a
                              href={
                                supermarket.websiteUrl.startsWith('http')
                                  ? supermarket.websiteUrl
                                  : `https://${supermarket.websiteUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-medium text-[12px]"
                            >
                              Website ↗
                            </a>
                          ) : (
                            <span className="text-text-disabled">—</span>
                          )}
                        </td>
                        <td className="px-[16px] py-[12px] text-[13px] font-semibold text-text-primary">
                          <span className="px-[8px] py-[3px] rounded bg-surface-variant text-text-secondary text-[12px]">
                            {sOffersCount} Deals
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-right">
                          <span
                            className={cn(
                              'inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full text-[11px] font-bold',
                              supermarket.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-surface-variant text-text-disabled'
                            )}
                          >
                            <span
                              className={cn(
                                'w-[6px] h-[6px] rounded-full',
                                supermarket.isActive !== false
                                  ? 'bg-emerald-500'
                                  : 'bg-text-disabled'
                              )}
                            />
                            {supermarket.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Section: Consumer Preference Rankings & Chain Share */}
        <div className="flex flex-col gap-[20px]">
          {/* Preference Ranking Breakdown (From GET /api/analytics/shopping-trends) */}
          <div className="bg-surface rounded-xl border border-border p-[18px] shadow-xs">
            <h3 className="text-[14px] font-bold text-text-primary m-0 mb-[2px]">
              Consumer Preference Ranking
            </h3>
            <p className="text-[11px] text-text-disabled m-0 mb-[14px]">
              Ranked dietary preferences across households
            </p>

            {shoppingTrends?.preferenceRanking && shoppingTrends.preferenceRanking.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {shoppingTrends.preferenceRanking.map((pref, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-[4px] p-[8px] rounded-lg bg-surface-variant/40 border border-border/50"
                  >
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-semibold text-text-primary">
                        {pref.preference} ({pref.category})
                      </span>
                      <span className="font-bold text-primary">{pref.percentage}%</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pref.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {[
                  { pref: 'Organic / Non-GMO', cat: 'Produce', pct: 42 },
                  { pref: 'Low Sodium / Sugar-Free', cat: 'Pantry', pct: 31 },
                  { pref: 'Halal Certified', cat: 'Meat & Poultry', pct: 88 },
                  { pref: 'Gluten-Free Options', cat: 'Bakery', pct: 24 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-[4px] p-[8px] rounded-lg bg-surface-variant/40 border border-border/50"
                  >
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-semibold text-text-primary">
                        {item.pref} ({item.cat})
                      </span>
                      <span className="font-bold text-primary">{item.pct}%</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Supermarket Chains Distribution (From GET /api/analytics/overview) */}
          <div className="bg-surface rounded-xl border border-border p-[18px] shadow-xs">
            <h3 className="text-[14px] font-bold text-text-primary m-0 mb-[2px]">
              Supermarket Chain Share
            </h3>
            <p className="text-[11px] text-text-disabled m-0 mb-[14px]">
              Aggregated catalog volume share
            </p>

            {overviewData?.topSupermarketChains && overviewData.topSupermarketChains.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {overviewData.topSupermarketChains.map((chain, i) => (
                  <div key={i} className="flex flex-col gap-[4px]">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-primary font-semibold">{chain.name}</span>
                      <span className="text-text-secondary font-bold">{chain.value}%</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(chain.value, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-text-disabled text-center py-[10px]">
                No chain share data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-[16px] right-[16px] bg-gray-900 text-white px-[16px] py-[8px] rounded-lg text-[13px] font-medium shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
