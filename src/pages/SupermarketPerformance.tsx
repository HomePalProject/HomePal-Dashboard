import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import { getImageUrl, getLocalString } from '@lib/formatters';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';
import type { ShoppingTrendsData } from '@typeDefs/analyticsTypes';
import type { AnalyticsOverviewData } from '@typeDefs/statsTypes';
import { productCategoryService } from '@services/productCategoryService';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';
import { useTranslation } from 'react-i18next';
import { getLocalizedCulture } from '@lib/formatters';
function SupermarketLogo({
  logoPath,
  name,
  className = 'w-9 h-9',
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
        'rounded-lg bg-primary/10 text-primary font-extrabold text-xs border border-primary/20 flex items-center justify-center shrink-0',
        className
      )}
    >
      {initials}
    </div>
  );
}

export default function SupermarketPerformance() {
  const { t, i18n } = useTranslation('stats');
  const navigate = useNavigate();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shoppingTrends, setShoppingTrends] = useState<ShoppingTrendsData | null>(null);
  const [overviewData, setOverviewData] = useState<AnalyticsOverviewData | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
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
      const [supermarketsRes, offersRes, trendsRes, overviewRes, categoriesRes] = await Promise.all(
        [
          catalogService.getSupermarkets().catch(() => []),
          catalogService.getOffers().catch(() => []),
          analyticsService.getShoppingTrends().catch(() => null),
          analyticsService.getOverview().catch(() => null),
          productCategoryService.getCategories().catch(() => []),
        ]
      );

      setSupermarkets(supermarketsRes);
      setOffers(offersRes);
      setShoppingTrends(trendsRes);
      setOverviewData(overviewRes);
      setCategories(categoriesRes);
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

    const headers = [
      t('thSupermarketPartner'),
      t('thFacebook'),
      t('thActiveOffers'),
      t('thStatus'),
    ];
    const rows = supermarkets.map((s) => {
      const name =
        getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') || getLocalString(s.name);
      const sOffers = offers.filter(
        (o) => o.supermarketId === s.id || o.supermarketName === name
      ).length;
      return [
        `"${name}"`,
        `"${s.websiteUrl || '—'}"`,
        sOffers,
        s.isActive !== false ? t('statusActive') : t('statusInactive'),
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
    showToast(t('toastExportSuccess'));
  };

  const filteredSupermarkets = supermarkets.filter((s) => {
    const name = (
      getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') || getLocalString(s.name)
    ).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-text-secondary">
          {t('loadingSupermarketAnalytics')}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 pb-4 font-sans relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-1 font-medium">
            <span>{t('homepalAdmin')}</span>
            <svg
              className="w-3 h-3 rtl:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-text-primary">{t('analytics')}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight m-0">
            {t('titlePerformance')}
          </h1>
          <p className="text-sm text-text-secondary m-0 mt-0.5">{t('subtitlePerformance')}</p>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-text-primary transition-all shadow-xs hover:bg-surface-variant cursor-pointer',
              isExporting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
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
            {t('exportCsv')}
          </button>
          <button
            onClick={() => navigate('/dashboard/supermarkets?openAdd=true')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-text-inverse border-none rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90 shadow-xs"
          >
            <svg
              className="w-4 h-4"
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
            {t('addPartner')}
          </button>
        </div>
      </div>

      {/* ── KPI Cards Section ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Supermarket Partner */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t('topSupermarketPartner')}
            </span>
            {(() => {
              const smName = shoppingTrends?.mostSuccessfulSupermarket || 'Carrefour';
              const smNameStr = smName.trim().toLowerCase();
              const sm = supermarkets.find((s) => {
                const nameStr = getLocalString(s.name).trim().toLowerCase();
                if (!nameStr && !s.id) return false;
                return (
                  s.id === smName || nameStr.includes(smNameStr) || smNameStr.includes(nameStr)
                );
              });
              if (sm) {
                return <SupermarketLogo name={smName} logoPath={sm.logoPath} className="w-9 h-9" />;
              }
              return (
                <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary shrink-0">
                  <svg
                    className="w-4.5 h-4.5"
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
              );
            })()}
          </div>
          <div className="text-xl font-bold text-text-primary tracking-tight">
            {shoppingTrends?.mostSuccessfulSupermarket || 'Carrefour'}
          </div>
          <div className="text-xs text-primary font-medium mt-1">
            {t('highestConsumerEngagement')}
          </div>
        </div>

        {/* Card 2: Most Purchased Category */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t('topPurchasedCategory')}
            </span>
            {(() => {
              const catName = shoppingTrends?.mostBoughtCategory?.name || 'Dairy & Eggs';
              const cat = categories.find((c) => {
                const nameStr =
                  getLocalizedCulture(c.name, 'en') || (typeof c.name === 'string' ? c.name : '');
                return nameStr === catName;
              });
              const imgUrl = getImageUrl(cat?.imagePath);
              if (imgUrl) {
                return (
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface border border-border">
                    <img src={imgUrl} alt={catName} className="w-full h-full object-cover" />
                  </div>
                );
              }
              return (
                <div className="w-9 h-9 rounded-lg bg-status-success-container flex items-center justify-center text-status-success shrink-0">
                  <svg
                    className="w-4.5 h-4.5"
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
              );
            })()}
          </div>
          <div className="text-xl font-bold text-text-primary tracking-tight truncate">
            {getLocalizedCulture(
              shoppingTrends?.mostBoughtCategory?.name,
              i18n.resolvedLanguage as 'en' | 'ar'
            ) ||
              shoppingTrends?.mostBoughtCategory?.name ||
              'Dairy & Eggs'}
          </div>
          <div className="text-xs text-status-success font-semibold mt-1">
            {shoppingTrends?.mostBoughtCategory?.percentage
              ? t('pctOfPurchases', { percentage: shoppingTrends.mostBoughtCategory.percentage })
              : t('highVolumeDemand')}
          </div>
        </div>

        {/* Card 3: Top Inventory Category */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t('topInventoryCategory')}
            </span>
            {(() => {
              const catName = shoppingTrends?.mostCommonInventoryCategory?.name || 'Beverages';
              const cat = categories.find((c) => {
                const nameStr =
                  getLocalizedCulture(c.name, 'en') || (typeof c.name === 'string' ? c.name : '');
                return nameStr === catName;
              });
              const imgUrl = getImageUrl(cat?.imagePath);
              if (imgUrl) {
                return (
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface border border-border">
                    <img src={imgUrl} alt={catName} className="w-full h-full object-cover" />
                  </div>
                );
              }
              return (
                <div className="w-9 h-9 rounded-lg bg-accent-container flex items-center justify-center text-accent shrink-0">
                  <svg
                    className="w-4.5 h-4.5"
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
              );
            })()}
          </div>
          <div className="text-xl font-bold text-text-primary tracking-tight truncate">
            {getLocalizedCulture(
              shoppingTrends?.mostCommonInventoryCategory?.name,
              i18n.resolvedLanguage as 'en' | 'ar'
            ) ||
              shoppingTrends?.mostCommonInventoryCategory?.name ||
              'Beverages'}
          </div>
          <div className="text-xs text-accent font-semibold mt-1">
            {shoppingTrends?.mostCommonInventoryCategory?.percentage
              ? t('pctOfTotalStock', {
                  percentage: shoppingTrends.mostCommonInventoryCategory.percentage,
                })
              : t('mostStocked')}
          </div>
        </div>

        {/* Card 4: Total Active Offers */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t('activeOffersCatalog')}
            </span>
            <div className="w-9 h-9 rounded-lg bg-status-info-container flex items-center justify-center text-status-info shrink-0">
              <svg
                className="w-4.5 h-4.5"
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
          <div className="text-xl font-bold text-text-primary tracking-tight">
            {t('activeCount', { count: offers.length })}
          </div>
          <div className="text-xs text-status-info font-semibold mt-1">
            {t('verifiedPartnerDeals')}
          </div>
        </div>
      </div>

      {/* ── Main Section Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Partner Supermarkets Table */}
        <div className="bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <h2 className="text-base font-bold text-text-primary m-0">
                {t('partnerSupermarkets')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary text-xs font-bold">
                {t('enrolledCount', { count: supermarkets.length })}
              </span>
            </div>
            <div className="relative w-full sm:w-[220px]">
              <input
                type="text"
                placeholder={t('searchPartner')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1.5 ps-7.5 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary h-8.5"
              />
              <svg
                className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-text-disabled"
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
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className="border-b border-border bg-surface-variant/30">
                  <th className="px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase whitespace-nowrap">
                    {t('thSupermarketPartner')}
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase whitespace-nowrap">
                    {t('thFacebookPage')}
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase whitespace-nowrap">
                    {t('thActiveOffers')}
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase text-end whitespace-nowrap">
                    {t('thStatus')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSupermarkets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-text-disabled text-sm">
                      {t('noMatchingSupermarkets')}
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <SupermarketLogo
                              logoPath={supermarket.logoPath}
                              name={name}
                              className="w-9 h-9"
                            />
                            <div>
                              <div className="text-sm font-semibold text-text-primary">
                                {getLocalizedCulture(
                                  supermarket.name,
                                  i18n.resolvedLanguage as 'en' | 'ar'
                                ) || getLocalString(supermarket.name)}
                              </div>
                              <div className="text-xs text-text-disabled">
                                {supermarket.address || t('partnerChain')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                          {supermarket.websiteUrl ? (
                            <a
                              href={
                                supermarket.websiteUrl.startsWith('http')
                                  ? supermarket.websiteUrl
                                  : `https://${supermarket.websiteUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-medium text-xs"
                            >
                              {t('facebookLink')}
                            </a>
                          ) : (
                            <span className="text-text-disabled">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-surface-variant text-text-secondary text-xs">
                            {t('dealsCount', { count: sOffersCount })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
                              supermarket.isActive !== false
                                ? 'bg-status-success-container text-status-success'
                                : 'bg-surface-variant text-text-disabled'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                supermarket.isActive !== false
                                  ? 'bg-status-success'
                                  : 'bg-text-disabled'
                              )}
                            />
                            {supermarket.isActive !== false
                              ? t('statusActive')
                              : t('statusInactive')}
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
        <div className="flex flex-col gap-5">
          {/* Preference Ranking Breakdown */}
          <div className="bg-surface rounded-xl border border-border p-4.5 shadow-xs">
            <h3 className="text-sm font-bold text-text-primary m-0 mb-0.5">
              {t('consumerPreferenceRanking')}
            </h3>
            <p className="text-xs text-text-disabled m-0 mb-3.5">{t('rankedDietaryPreferences')}</p>

            {shoppingTrends?.preferenceRanking && shoppingTrends.preferenceRanking.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {shoppingTrends.preferenceRanking.map((pref, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-2 rounded-lg bg-surface-variant/40 border border-border/50"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-text-primary">
                        {getLocalizedCulture(
                          pref.preference,
                          i18n.resolvedLanguage as 'en' | 'ar'
                        ) || getLocalString(pref.preference)}{' '}
                        (
                        {getLocalizedCulture(pref.category, i18n.resolvedLanguage as 'en' | 'ar') ||
                          getLocalString(pref.category)}
                        )
                      </span>
                      <span className="font-bold text-primary">{pref.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pref.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {[
                  { pref: 'Organic / Non-GMO', cat: 'Produce', pct: 42 },
                  { pref: 'Low Sodium / Sugar-Free', cat: 'Pantry', pct: 31 },
                  { pref: 'Halal Certified', cat: 'Meat & Poultry', pct: 88 },
                  { pref: 'Gluten-Free Options', cat: 'Bakery', pct: 24 },
                ].map((item, i) => {
                  const displayPref =
                    item.pref === 'Organic / Non-GMO'
                      ? t('prefOrganic')
                      : item.pref === 'Low Sodium / Sugar-Free'
                        ? t('prefLowSodium')
                        : item.pref === 'Halal Certified'
                          ? t('prefHalal')
                          : t('prefGlutenFree');
                  const displayCat =
                    item.cat === 'Produce'
                      ? t('catProduce')
                      : item.cat === 'Pantry'
                        ? t('catPantry')
                        : item.cat === 'Meat & Poultry'
                          ? t('catMeat')
                          : t('catBakery');
                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-1 p-2 rounded-lg bg-surface-variant/40 border border-border/50"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-text-primary">
                          {displayPref} ({displayCat})
                        </span>
                        <span className="font-bold text-primary">{item.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Supermarket Chains Distribution */}
          <div className="bg-surface rounded-xl border border-border p-4.5 shadow-xs">
            <h3 className="text-sm font-bold text-text-primary m-0 mb-0.5">
              {t('supermarketChainShare')}
            </h3>
            <p className="text-xs text-text-disabled m-0 mb-3.5">
              {t('aggregatedCatalogVolumeShare')}
            </p>

            {overviewData?.topSupermarketChains && overviewData.topSupermarketChains.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {overviewData.topSupermarketChains.map((chain, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-primary font-semibold">
                        {getLocalizedCulture(chain.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                          getLocalString(chain.name)}
                      </span>
                      <span className="text-text-secondary font-bold">{chain.value}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full bg-status-success rounded-full"
                        style={{ width: `${Math.min(chain.value, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-disabled text-center py-2.5">
                {t('noChainShareData')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 inset-e-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
