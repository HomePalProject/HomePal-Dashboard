import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { MetricCard } from '@components/dashboard/MetricCard';
import { SystemHealthCard } from '@components/dashboard/SystemHealthCard';
import { Card, CardHeader, CardContent } from '@components/ui/Card';

import { analyticsService } from '@services/analyticsService';
import api from '@services/api';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';

import { getHour } from '@lib/formatters';

const SYSTEM_PULSE = [
  {
    title: 'New Preference Category',
    desc: '"Energy Saving" rules updated.',
    time: 'Just now',
    type: 'pref',
  },
  {
    title: 'System Check',
    desc: 'All endpoints responding normally.',
    time: '15 min ago',
    type: 'system',
  },
  {
    title: 'New Household',
    desc: 'A new household was registered.',
    time: '1 hour ago',
    type: 'household',
  },
];

export default function Overview() {
  const token = useAuthStore((s) => s.token);
  const [categoriesCount, setCategoriesCount] = useState<number | '—'>('—');
  const [summaryData, setSummaryData] = useState<HouseholdsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = `Good ${getHour()}.`;

  useEffect(() => {
    (async () => {
      try {
        const [summaryRes, catRes] = await Promise.all([
          analyticsService.getHouseholdsSummary(),
          api.get('/preferences/categories').catch(() => ({ data: [] })),
        ]);
        setSummaryData(summaryRes);

        let cats = [];
        if (Array.isArray(catRes.data?.data)) cats = catRes.data.data;
        else if (Array.isArray(catRes.data)) cats = catRes.data;
        else if (Array.isArray(catRes.data?.items)) cats = catRes.data.items;

        setCategoriesCount(cats.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const HouseIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 3L21 12" />
      <path d="M5 10V20a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
    </svg>
  );

  const TagIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-16">
      {/* Greeting */}
      <div>
        <h1 className="text-32 md:text-[40px] font-extrabold text-text-primary tracking-tight leading-tight m-0">
          {greeting}
        </h1>
        <p className="text-[15px] text-text-secondary mt-8 m-0">
          Your HomePal network is performing optimally today.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_220px] gap-16 min-h-70">
        {/* Large household card */}
        <div className="sm:row-span-2">
          <MetricCard
            icon={HouseIcon}
            value={summaryData?.totalHouseholds?.toLocaleString() ?? '—'}
            label="Total Households Managed"
            badge="Platform"
            note="Based on aggregated demographics"
            delay={0}
          />
        </div>

        {/* Categories card */}
        <div className="sm:row-span-2">
          <MetricCard
            icon={TagIcon}
            value={categoriesCount}
            label="Global Preference Categories"
            delay={80}
          />
        </div>

        {/* System Health card */}
        <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <SystemHealthCard delay={160} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-20">
        {/* Aggregated Analytics Card */}
        <Card noPadding className="flex flex-col">
          <CardHeader className="flex justify-between items-start">
            <div>
              <div className="text-18 font-bold text-text-primary leading-none">
                Aggregated Analytics
              </div>
              <div className="text-13 text-text-disabled mt-4">Privacy-safe platform metrics.</div>
            </div>
            <Link
              to="/dashboard/households"
              className="text-12 font-bold tracking-[0.06em] uppercase text-primary bg-primary-container px-16 sm:px-56 py-24 rounded-md no-underline hover:bg-primary-container/80 transition-colors whitespace-nowrap"
            >
              Full Report
            </Link>
          </CardHeader>

          <CardContent className="flex-1">
            {loading || !summaryData ? (
              <div className="py-48 text-center flex justify-center">
                <div className="w-24 h-24 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex justify-between py-16 border-b border-surface-variant">
                  <span className="text-14 font-semibold text-text-primary">Active Households</span>
                  <span className="text-14 font-bold text-primary">
                    {summaryData?.activeHouseholds?.toLocaleString() ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between py-16 border-b border-surface-variant">
                  <span className="text-14 font-semibold text-text-primary">
                    Avg. Household Size
                  </span>
                  <span className="text-14 font-bold text-primary">
                    {summaryData.avgHouseholdSize} members
                  </span>
                </div>
                <div className="flex justify-between py-16">
                  <span className="text-14 font-semibold text-text-primary">
                    Platform Penetration
                  </span>
                  <span className="text-14 font-bold text-primary">12% YoY</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Pulse Card */}
        <Card noPadding className="flex flex-col">
          <CardContent className="flex-1 flex flex-col pb-0">
            <div className="text-18 font-bold text-text-primary mb-20">System Pulse</div>
            <div className="flex-1 flex flex-col gap-0">
              {SYSTEM_PULSE.map((item, i) => (
                <div
                  key={i}
                  className={`pb-16 mb-16 ${i < SYSTEM_PULSE.length - 1 ? 'border-b border-surface-variant' : ''}`}
                >
                  <div className="flex gap-8 items-start">
                    <span
                      className={`mt-4 w-7 h-7 rounded-full shrink-0 ${
                        item.type === 'pref'
                          ? 'bg-primary'
                          : item.type === 'household'
                            ? 'bg-accent'
                            : 'bg-text-disabled'
                      }`}
                    />
                    <div>
                      <div className="text-13 font-semibold text-text-primary">{item.title}</div>
                      <div className="text-12 text-text-disabled mt-[8px]">{item.desc}</div>
                      <div className="text-[11px] text-text-disabled/70 mt-4 uppercase tracking-[0.04em] font-semibold">
                        {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="border-t border-surface-variant py-20 mt-auto">
            <button className="w-full bg-transparent border-none text-[11px] font-bold tracking-[0.1em] uppercase text-text-disabled cursor-pointer text-center transition-colors hover:text-primary">
              Audit Full Logs
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
