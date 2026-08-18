import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { analyticsService } from '@services/analyticsService';
import { catalogService } from '@services/catalogService';
import { productCategoryService } from '@services/productCategoryService';
import { SystemHealthCard } from '@components/dashboard/SystemHealthCard';

import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import type { Supermarket } from '@typeDefs/catalogTypes';
import type { MealPlansSummaryData } from '@typeDefs/analyticsTypes';
import type { ProductCategory } from '@typeDefs/productCategoryTypes';

import { getHour } from '@lib/formatters';

export default function Overview() {
  const token = useAuthStore((s) => s.token);
  const [summaryData, setSummaryData] = useState<HouseholdsSummaryData | null>(null);
  const [mealPlansSummary, setMealPlansSummary] = useState<MealPlansSummaryData | null>(null);
  const [realSupermarkets, setRealSupermarkets] = useState<Supermarket[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = `Good ${getHour()}.`;

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
  }, [token]);

  return (
    <div className="w-full space-y-8 font-sans pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 pt-2">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-tight m-0">
            {greeting}
          </h1>
          <p className="text-sm text-text-secondary mt-2 m-0 leading-relaxed max-w-lg">
            Welcome back to your operational command center. Here is the latest summary across your
            households and catalog networks.
          </p>
        </div>

        <Link
          to="/dashboard/households"
          className="hidden sm:flex group relative px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold no-underline transition-all shadow-md hover:shadow-lg shrink-0 items-center gap-2 overflow-hidden"
        >
          <span className="relative z-10">Manage Households</span>
          <svg
            className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform"
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

      {/* ── Main Content Grid ── */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-6 md:gap-8">
        {/* System Health (Order 1 on mobile, Col 3 Row 1 on desktop) */}
        <div className="xl:col-start-3 xl:row-start-1 order-1">
          <div className="min-h-[220px] h-full">
            <SystemHealthCard delay={100} />
          </div>
        </div>

        {/* Mobile-Only Manage Households Button (Order 2 on mobile, Hidden on desktop) */}
        <div className="flex sm:hidden order-2 justify-end">
          <Link
            to="/dashboard/households"
            className="w-full justify-center group relative px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold no-underline transition-all shadow-md shrink-0 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10">Manage Households</span>
            <svg
              className="w-4 h-4 relative z-10"
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

        {/* Left Column: Key Metrics & Demographics (Order 3 on mobile, Col 1-2 Row 1-2 on desktop) */}
        <div className="xl:col-span-2 xl:col-start-1 xl:row-start-1 xl:row-span-2 space-y-6 md:space-y-8 order-3">
          {/* ── Key Metrics Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Total Households */}
            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-[120px] h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                    Total Households
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
                  Enrolled across platform
                </div>
              </div>
            </div>

            {/* Active Households */}
            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-[120px] h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                    Active Households
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
                    <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-full border border-status-success/20">
                      {Math.round(
                        (summaryData.activeHouseholds / summaryData.totalHouseholds) * 100
                      )}
                      %
                    </span>
                  ) : null}
                </div>
                <div className="text-xs font-semibold text-text-disabled mt-1">
                  Currently active rate
                </div>
              </div>
            </div>

            {/* AI Meal Plans */}
            <div className="group p-5 rounded-2xl bg-surface border border-border/60 hover:border-amber-500/30 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-[120px] h-fit">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                    Meal Plans
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
                  Generated by AI assistant
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg md:text-xl font-black text-text-primary tracking-tight m-0">
              Network Demographics
            </h2>
            <p className="text-xs font-medium text-text-secondary m-0">
              Averages across all enrolled users.
            </p>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Ribbon */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-6 rounded-2xl bg-surface-variant/40 border border-border/40 hover:bg-surface-variant/60 transition-colors">
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1">
                    Avg. Household Size
                  </div>
                  <div className="text-2xl font-black text-text-primary tracking-tight">
                    {summaryData?.avgHouseholdSize
                      ? `${Math.round(summaryData.avgHouseholdSize)} members`
                      : '1 member'}
                  </div>
                </div>

                <div className="flex-1 p-6 rounded-2xl bg-surface-variant/40 border border-border/40 hover:bg-surface-variant/60 transition-colors">
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] mb-1">
                    Avg. Plans / Household
                  </div>
                  <div className="text-2xl font-black text-text-primary tracking-tight">
                    {mealPlansSummary?.mealPlansPerHousehold
                      ? `${Math.round(mealPlansSummary.mealPlansPerHousehold)} plans`
                      : '0 plans'}
                  </div>
                </div>
              </div>

              {/* Supermarkets Network - Visual but Monochromatic */}
              <div className="bg-surface rounded-2xl border border-border/60 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-text-primary tracking-tight m-0">
                    Partner Supermarket Chains
                  </h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                    {realSupermarkets.length} Integrated
                  </span>
                </div>

                {realSupermarkets.length > 0 ? (
                  <div className="space-y-5">
                    {(() => {
                      const total = realSupermarkets.length;
                      const baseShare = Math.floor(100 / total);
                      const remainder = 100 - baseShare * total;

                      return realSupermarkets.map((s, idx) => {
                        const nameStr = Array.isArray(s.name)
                          ? s.name[0]?.value || 'Supermarket'
                          : typeof s.name === 'string'
                            ? s.name
                            : 'Supermarket';

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
                      No partner supermarkets integrated yet.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Global Categories (Order 4 on mobile, Col 3 Row 2 on desktop) */}
        <div className="xl:col-span-1 xl:col-start-3 xl:row-start-2 order-4">
          <div className="bg-surface rounded-2xl border border-border/60 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-surface-variant/20">
              <div>
                <h3 className="text-sm font-black text-text-primary tracking-tight m-0">
                  Global Categories
                </h3>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1 block">
                  {categories.length} Total
                </span>
              </div>
              <Link
                to="/dashboard/categories"
                className="w-8 h-8 rounded-full bg-surface-variant hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors text-text-secondary"
                title="Manage Categories"
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
                    const catName = Array.isArray(cat.name)
                      ? cat.name[0]?.value || 'Category'
                      : typeof cat.name === 'string'
                        ? cat.name
                        : 'Category';
                    return (
                      <div
                        key={cat.id}
                        className="group p-3 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center justify-between cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-text-disabled w-4 text-right">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
                            {catName}
                          </span>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity"
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
                  {loading ? 'Loading...' : 'No categories found.'}
                </div>
              )}
            </div>

            <div className="p-5 bg-surface-variant/20 border-t border-border/40 text-[11px] font-medium text-text-secondary leading-relaxed">
              Explore the categories section to organize product rules and household dietary
              constraints.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
