import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@lib/utils';

export interface IngestionDay {
  label: string;
  dateStr: string;
  count: number;
  isToday: boolean;
}

interface DeskViewMetricsProps {
  needsReviewCount: number;
  activePipelinesCount: number;
  catalogOffersCount: number;
  ingestionDays: IngestionDay[];
  maxIngestionCount: number;
}

export default function DeskViewMetrics({
  needsReviewCount,
  activePipelinesCount,
  catalogOffersCount,
  ingestionDays,
  maxIngestionCount,
}: DeskViewMetricsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('scrapingPipeline');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
      <h3 className="text-sm font-extrabold text-slate-900 m-0">{t('deskView')}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => navigate('/dashboard/offers')}
          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col cursor-pointer hover:bg-slate-100/80 transition-colors"
          title="Click to view and verify unverified offers in Offers Hub"
        >
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {t('needsReview')}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1">{needsReviewCount}</span>
          <span className="text-xs text-amber-700 font-semibold mt-0.5">
            {t('unverifiedOffers')}
          </span>
        </div>

        <div
          onClick={() => navigate('/dashboard/supermarkets')}
          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col cursor-pointer hover:bg-slate-100/80 transition-colors"
          title="Click to manage supermarket chains"
        >
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {t('activePipelines')}
          </span>
          <span className="text-2xl font-black text-[#1F3D32] mt-1">{activePipelinesCount}</span>
          <span className="text-xs text-emerald-800 font-semibold mt-0.5">
            {t('supermarketChains')}
          </span>
        </div>
      </div>

      {/* Daily Scraped Offers Ingestion Bar Chart Widget */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {t('dailyIngestion')}
            </span>
            <span className="text-sm text-slate-400 font-medium">{t('scrapedSynced')}</span>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {t('totalOffersCount', { count: catalogOffersCount })}
          </span>
        </div>
        <div className="flex items-end justify-between h-14 gap-1.5 pt-3">
          {ingestionDays.map((d) => {
            const heightPercent = Math.max(15, Math.round((d.count / maxIngestionCount) * 100));
            return (
              <div
                key={d.label + d.dateStr}
                className={cn(
                  'w-full rounded-xs transition-all',
                  d.isToday ? 'bg-[#1F3D32]' : 'bg-slate-200 hover:bg-slate-300'
                )}
                style={{ height: `${heightPercent}%` }}
                title={`${d.label} (${d.dateStr}): ${d.count} offers`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
          {ingestionDays.map((d) => (
            <span
              key={d.label + d.dateStr}
              className={cn(d.isToday && 'text-[#1F3D32] font-black')}
            >
              {d.label === 'Today'
                ? t('today')
                : d.label === 'Yesterday'
                  ? t('yesterday')
                  : d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
