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
    <div className="w-full space-y-6 font-sans pb-10">
      {/* ── Clean Human Greeting Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-1">
        <div>
          <h1 className="text-28 md:text-36 font-extrabold text-[#2d2a26] tracking-tight leading-tight m-0">
            {greeting}
          </h1>
          <p className="text-sm text-[#6d6862] mt-1 m-0">
            Welcome back. Here is the latest operational summary across your households and catalog
            networks.
          </p>
        </div>

        <Link
          to="/dashboard/households"
          className="px-24 py-12 bg-[#356859] hover:bg-[#2a5347] text-white rounded-xl text-xs font-bold no-underline transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          Manage Households
        </Link>
      </div>

      {/* ── Metric & System Health Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Households */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4e0da] shadow-xs hover:border-[#356859]/50 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d6862]">
              Total Households
            </span>
            <div className="p-2 rounded-xl bg-[#faf8f3] text-[#356859] border border-[#e4e0da]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12L12 3L21 12" />
                <path d="M5 10V20a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2d2a26] tracking-tight">
              {loading ? '...' : (summaryData?.totalHouseholds?.toLocaleString() ?? '0')}
            </div>
            <div className="text-[11px] font-semibold text-[#6d6862] mt-1">
              Enrolled across platform
            </div>
          </div>
        </div>

        {/* Active Households */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4e0da] shadow-xs hover:border-[#356859]/50 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d6862]">
              Active Households
            </span>
            <div className="p-2 rounded-xl bg-[#faf8f3] text-[#356859] border border-[#e4e0da]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2d2a26] tracking-tight">
              {loading ? '...' : (summaryData?.activeHouseholds?.toLocaleString() ?? '0')}
            </div>
            <div className="text-[11px] font-semibold text-[#356859] mt-1">
              {summaryData?.totalHouseholds && summaryData.totalHouseholds > 0
                ? `${Math.round((summaryData.activeHouseholds / summaryData.totalHouseholds) * 100)}% active rate`
                : 'Active status'}
            </div>
          </div>
        </div>

        {/* AI Meal Plans */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4e0da] shadow-xs hover:border-[#356859]/50 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d6862]">
              Meal Plans
            </span>
            <div className="p-2 rounded-xl bg-[#faf8f3] text-[#d99a3d] border border-[#e4e0da]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2d2a26] tracking-tight">
              {loading ? '...' : (mealPlansSummary?.mealPlansTotal?.toLocaleString() ?? '0')}
            </div>
            <div className="text-[11px] font-semibold text-[#6d6862] mt-1">
              Generated by AI assistant
            </div>
          </div>
        </div>

        {/* System Health Spinning Card (Restored as requested) */}
        <div className="min-h-[160px]">
          <SystemHealthCard delay={100} />
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Household & Catalog Summary (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e4e0da] p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#f4f2ee] pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#2d2a26] m-0">
                Households & Catalog Distribution
              </h2>
              <p className="text-xs text-[#6d6862] m-0 mt-0.5">
                Detailed demographics and supermarket network coverage.
              </p>
            </div>
            <Link
              to="/dashboard/households"
              className="px-3 py-1.5 text-xs font-bold text-[#356859] bg-[#faf8f3] hover:bg-[#f4f2ee] border border-[#e4e0da] rounded-xl no-underline transition-colors"
            >
              Full Report
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-semibold text-[#6d6862]">
              Loading summary data...
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Demographics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-12 rounded-xl bg-[#faf8f3] border border-[#e4e0da] space-y-1">
                  <div className="text-xs font-bold text-[#6d6862] uppercase tracking-wider">
                    Avg. Household Size
                  </div>
                  <div className="text-xl font-black text-[#2d2a26]">
                    {summaryData?.avgHouseholdSize
                      ? `${Math.round(summaryData.avgHouseholdSize)} members`
                      : '1 member'}
                  </div>
                  <div className="text-[11px] text-[#6d6862]">Average active family size</div>
                </div>

                <div className="p-12 rounded-xl bg-[#faf8f3] border border-[#e4e0da] space-y-1">
                  <div className="text-xs font-bold text-[#6d6862] uppercase tracking-wider">
                    Avg. Plans / Household
                  </div>
                  <div className="text-xl font-black text-[#2d2a26]">
                    {mealPlansSummary?.mealPlansPerHousehold
                      ? `${Math.round(mealPlansSummary.mealPlansPerHousehold)} plans`
                      : '0 plans'}
                  </div>
                  <div className="text-[11px] text-[#6d6862]">Generated per household</div>
                </div>
              </div>

              {/* Supermarket Network Share */}
              <div className="space-y-3 pt-2 border-t border-[#f4f2ee]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#2d2a26] uppercase tracking-wider m-0">
                    Partner Supermarket Chains
                  </h3>
                  <span className="text-xs font-bold text-[#6d6862]">
                    {realSupermarkets.length} Chains
                  </span>
                </div>

                {realSupermarkets.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const total = realSupermarkets.length;
                      const baseShare = Math.floor(100 / total);
                      const remainder = 100 - baseShare * total;
                      const colors = [
                        'bg-[#356859]',
                        'bg-[#d99a3d]',
                        'bg-[#2a5347]',
                        'bg-[#6d6862]',
                      ];

                      return realSupermarkets.map((s, idx) => {
                        const nameStr = Array.isArray(s.name)
                          ? s.name[0]?.value || 'Supermarket'
                          : typeof s.name === 'string'
                            ? s.name
                            : 'Supermarket';
                        const shareVal = baseShare + (idx === 0 ? remainder : 0);

                        return (
                          <div key={s.id || idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#2d2a26]">{nameStr}</span>
                              <span className="font-extrabold text-[#356859]">{shareVal}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#f4f2ee] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${shareVal}%` }}
                                className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#faf8f3] text-xs text-[#6d6862] text-center">
                    No partner supermarkets found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Preference Categories Side Card */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#f4f2ee] pb-3">
              <h3 className="text-sm font-bold text-[#2d2a26] uppercase tracking-wider m-0">
                Categories ({categories.length})
              </h3>
              <Link
                to="/dashboard/categories"
                className="text-xs font-bold text-[#356859] hover:underline no-underline"
              >
                Manage
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="space-y-2">
                {categories.slice(0, 7).map((cat) => {
                  const catName = Array.isArray(cat.name)
                    ? cat.name[0]?.value || 'Category'
                    : typeof cat.name === 'string'
                      ? cat.name
                      : 'Category';
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-[#faf8f3] border border-[#e4e0da] text-xs font-bold text-[#2d2a26] flex items-center justify-between"
                    >
                      <span className="truncate">{catName}</span>
                      <span className="w-2 h-2 rounded-full bg-[#356859] shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#faf8f3] text-xs text-[#6d6862] text-center">
                Loading categories...
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf8f3] border border-[#e4e0da] text-xs text-[#6d6862] leading-relaxed">
            <span className="font-bold text-[#2d2a26]">Need help? </span>
            Explore the categories section to organize product rules and household dietary
            constraints.
          </div>
        </div>
      </div>
    </div>
  );
}
