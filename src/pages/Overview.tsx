import { SystemHealthCard } from '@components/dashboard/SystemHealthCard';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import { productCategoryService } from '@services/productCategoryService';
import { useAuthStore } from '@store/authStore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { MealPlansSummaryData } from '@typeDefs/analyticsTypes';
import type { Supermarket } from '@typeDefs/catalogTypes';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';

import { getHour, getLocalizedCulture } from '@lib/formatters';
import { useTranslation } from 'react-i18next';

export default function Overview() {
  const { t, i18n } = useTranslation('overview');
  const token = useAuthStore((s) => s.token);
  const [summaryData, setSummaryData] = useState<HouseholdsSummaryData | null>(null);
  const [mealPlansSummary, setMealPlansSummary] = useState<MealPlansSummaryData | null>(null);
  const [realSupermarkets, setRealSupermarkets] = useState<Supermarket[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = t(getHour());

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [summaryRes, mealPlansRes, superRes, catRes] = await Promise.all([
          analyticsService.getHouseholdsSummary().catch(() => null),
          analyticsService.getMealPlansSummary().catch(() => null),
          catalogService.getSupermarkets().catch(() => []),
          productCategoryService.getCategories().catch(() => []),
        ]);

        if (isMounted) {
          setSummaryData(summaryRes);
          setMealPlansSummary(mealPlansRes);
          setRealSupermarkets(superRes);
          setCategories(catRes);
        }
      } catch (err) {
        console.error('Failed to load Overview data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [token, i18n.language]);

  return (
    <div className="w-full space-y-8 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-2">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-tight m-0">
            {greeting}
          </h1>
          <p className="text-sm text-text-secondary mt-2 m-0 leading-relaxed max-w-lg">
            {t('subtitle')}
          </p>
        </div>

        <Link
          to="/dashboard/households"
          className="hidden sm:flex group relative px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold no-underline transition-all shadow-md hover:shadow-lg shrink-0 items-center gap-2 overflow-hidden"
        >
          <span className="relative z-10">{t('manageHouseholds')}</span>
          <svg
            className="w-4 h-4 relative z-10 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-6 md:gap-8">
        <div className="xl:col-start-3 xl:row-start-1 order-1">
          <div className="min-h-[220px] h-full">
            <SystemHealthCard delay={100} />
          </div>
        </div>

        <div className="flex sm:hidden order-2 justify-end">
          <Link
            to="/dashboard/households"
            className="w-full justify-center group relative px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold no-underline transition-all shadow-md shrink-0 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10">{t('manageHouseholds')}</span>
            <svg
              className="w-4 h-4 relative z-10 rtl:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="xl:col-span-2 xl:col-start-1 xl:row-start-1 xl:row-span-2 space-y-6 md:space-y-8 order-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-30 h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs rtl:text-base font-black uppercase tracking-[0.2em] text-text-secondary">
                    {t('totalHouseholds')}
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-variant/50 text-text-secondary group-hover:text-primary transition-colors">
                    <svg
                      className="w-5 h-5"
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
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-text-primary tracking-tighter">
                    {loading ? '...' : (summaryData?.totalHouseholds?.toLocaleString() ?? '0')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-text-disabled mt-1">
                  {t('enrolledPlatform')}
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-30 h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs rtl:text-base font-black uppercase tracking-[0.2em] text-text-secondary">
                    {t('activeHouseholds')}
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-variant/50 text-text-secondary group-hover:text-status-success transition-colors">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-text-primary tracking-tighter">
                    {loading ? '...' : (summaryData?.activeHouseholds?.toLocaleString() ?? '0')}
                  </span>
                  {summaryData?.totalHouseholds && summaryData.totalHouseholds > 0 ? (
                    <span className="text-xs font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-full border border-status-success/20">
                      {Math.round(
                        (summaryData.activeHouseholds / summaryData.totalHouseholds) * 100
                      )}
                      %
                    </span>
                  ) : null}
                </div>
                <div className="text-xs font-semibold text-text-disabled mt-1">
                  {t('activeRateDesc')}
                </div>
              </div>
            </div>

            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-amber-500/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-30 h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs rtl:text-base font-black uppercase tracking-[0.2em] text-text-secondary">
                    {t('mealPlans')}
                  </div>
                  <div className="p-1.5 rounded-lg bg-surface-variant/50 text-text-secondary group-hover:text-amber-600 transition-colors">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-text-primary tracking-tighter">
                    {loading ? '...' : (mealPlansSummary?.mealPlansTotal?.toLocaleString() ?? '0')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-text-disabled mt-1">
                  {t('generatedByAi')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg md:text-xl font-black text-text-primary tracking-tight m-0">
              {t('networkDemographics')}
            </h2>
            <p className="text-xs font-medium text-text-secondary m-0">{t('averagesEnrolled')}</p>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-6 rounded-2xl bg-surface-variant/40 border border-border/40 hover:bg-surface-variant/60 transition-colors">
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-[0.15em] mb-1">
                    {t('avgHouseholdSize')}
                  </div>
                  <div className="text-2xl font-black text-text-primary tracking-tight">
                    {t('members', {
                      count: summaryData?.avgHouseholdSize
                        ? Math.round(summaryData.avgHouseholdSize)
                        : 1,
                    })}
                  </div>
                </div>

                <div className="flex-1 p-6 rounded-2xl bg-surface-variant/40 border border-border/40 hover:bg-surface-variant/60 transition-colors">
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-[0.15em] mb-1">
                    {t('avgPlansPerHousehold')}
                  </div>
                  <div className="text-2xl font-black text-text-primary tracking-tight">
                    {t('plans', {
                      count: mealPlansSummary?.mealPlansPerHousehold
                        ? Math.round(mealPlansSummary.mealPlansPerHousehold)
                        : 0,
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border/60 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-text-primary tracking-tight m-0">
                    {t('partnerChains')}
                  </h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                    {t('integrated', { count: realSupermarkets.length })}
                  </span>
                </div>

                {realSupermarkets.length > 0 ? (
                  <div className="space-y-5">
                    {(() => {
                      const total = realSupermarkets.length;
                      const baseShare = Math.floor(100 / total);
                      const remainder = 100 - baseShare * total;

                      return realSupermarkets.map((s, idx) => {
                        const nameStr =
                          getLocalizedCulture(s.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                          t('supermarket');
                        const shareVal = baseShare + (idx === 0 ? remainder : 0);

                        return (
                          <div key={s.id || idx} className="group relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                                <svg
                                  className="w-3.5 h-3.5 text-text-secondary"
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
                                {nameStr}
                              </span>
                              <span className="text-xs font-black text-text-secondary">
                                {shareVal}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-variant/80 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${shareVal}%` }}
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out opacity-70 group-hover:opacity-100 shadow-sm"
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <span className="text-xs font-medium text-text-disabled">
                      {t('noPartners')}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="xl:col-span-1 xl:col-start-3 xl:row-start-2 order-4">
          <div className="bg-surface rounded-2xl border border-border/60 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-surface-variant/20">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight m-0">
                  {t('globalCategories')}
                </h3>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1 block">
                  {t('total', { count: categories.length })}
                </span>
              </div>
              <Link
                to="/dashboard/categories"
                className="w-8 h-8 rounded-full bg-surface-variant hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors text-text-secondary"
                title={t('manageCategories')}
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            </div>

            <div className="flex-1 p-4">
              {categories.length > 0 ? (
                <div className="space-y-1.5">
                  {categories.slice(0, 8).map((cat, i) => {
                    return (
                      <div
                        key={cat.id}
                        className="group p-3 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center justify-between cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-text-disabled w-4 text-end">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                            {getLocalizedCulture(cat.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                              'Category'}
                          </span>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full min-h-[200px] flex items-center justify-center text-xs font-medium text-text-disabled">
                  {loading ? t('loading') : t('noCategories')}
                </div>
              )}
            </div>

            <div className="p-5 bg-surface-variant/20 border-t border-border/40 text-sm font-medium text-text-secondary leading-relaxed">
              {t('exploreCategoriesDesc')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
