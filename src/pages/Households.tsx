import { MOCK_HOUSEHOLDS_DATA } from '@constants/householdsData';
import { getErrorMessage } from '@lib/utils';
import { formatCurrencyString } from '@lib/formatters';
import { analyticsService } from '@services/analyticsService';
import type { HouseholdsSummaryData } from '@typeDefs/householdsTypes';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Households() {
  const { t } = useTranslation('households');
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
    return <div className="p-10 text-text-disabled font-sans">{t('loading')}</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-15 font-sans">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-[8px] mb-[8px] flex-wrap">
          <h1 className="text-[22px] sm:text-[28px] font-extrabold text-text-primary tracking-tight m-0">
            {t('title')}
          </h1>
          <span className="bg-primary-container text-primary text-[11px] font-bold px-[8px] py-[4px] rounded-full uppercase tracking-wider">
            {t('privacyBadge')}
          </span>
        </div>
        <p className="text-typography-bodysmall text-text-secondary max-w-150 m-0">
          {t('privacyDesc')}
        </p>
      </div>

      {error && (
        <div className="p-1 text-sm text-status-error bg-status-error-container rounded-3xl border border-status-error/20">
          {error} ({t('fallbackData')})
        </div>
      )}

      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-[13px] font-semibold text-text-disabled mb-[8px]">
            {t('totalRegistered')}
          </div>
          <div className="text-[32px] font-extrabold text-text-primary">
            {data.totalHouseholds.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-primary mt-[4px]">
            {data.growthRate} {t('yoy')}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-[13px] font-semibold text-text-disabled mb-[8px]">
            {t('activeThisMonth')}
          </div>
          <div className="text-[32px] font-extrabold text-text-primary">
            {data.activeHouseholds.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">
            {t('activityRate')}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-[13px] font-semibold text-text-disabled mb-[8px]">
            {t('avgHouseholdSize')}
          </div>
          <div className="text-[32px] font-extrabold text-text-primary">
            {data.avgHouseholdSize}
          </div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">
            {t('membersPerHousehold')}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-[13px] font-semibold text-text-disabled mb-[8px]">
            {t('avgMonthlyIncome')}
          </div>
          <div className="text-[32px] font-extrabold text-text-primary">
            {formatCurrencyString(data.avgHouseholdIncome, t('currency'))}
          </div>
          <div className="text-xs font-semibold text-text-secondary mt-[4px]">
            {t('selfReported')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Top Regions ── */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-base font-bold text-text-primary mb-6">{t('adoptionByRegion')}</h2>

          <div className="flex flex-col gap-5">
            {data.topRegions.map((region, i) => (
              <div key={i}>
                <div className="flex justify-between text-[13px] font-semibold text-text-primary mb-[8px]">
                  <span>{region.name}</span>
                  <span className="text-text-secondary">
                    {region.count.toLocaleString()} ({region.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-surface-variant rounded-3xl overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-3xl transition-all duration-500 ease-out"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Size Distribution ── */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-base font-bold text-text-primary mb-6">{t('sizeDemographics')}</h2>

          <div className="flex flex-col gap-5">
            {data.sizeDistribution.map((item, i) => {
              const max = Math.max(...data.sizeDistribution.map((d) => d.count));
              const pct = Math.round((item.count / max) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-[13px] font-semibold text-text-primary mb-[8px]">
                    <span>{item.size}</span>
                    <span className="text-text-secondary">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-surface-variant rounded-3xl overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-3xl transition-all duration-500 ease-out"
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
