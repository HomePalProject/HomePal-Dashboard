import { useTranslation } from 'react-i18next';
import { cn } from '@lib/utils';

interface LiveScraperStatusProps {
  isRunning: boolean;
  totalParsedCount: number;
}

export default function LiveScraperStatus({ isRunning, totalParsedCount }: LiveScraperStatusProps) {
  const { t } = useTranslation('scrapingPipeline');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
        {t('engineStatus')}
      </h3>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              isRunning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
            )}
          />
          <span>{isRunning ? t('engineActive') : t('engineIdle')}</span>
        </div>
        <span className="text-sm font-mono text-slate-500">v2.4-production</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">{t('backendEndpoint')}</span>
          <span className="font-mono font-medium text-slate-900 truncate max-w-37.5">
            /scrape/facebook-page
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">{t('imageIngestion')}</span>
          <span className="font-mono font-medium text-slate-900 truncate max-w-37.5">
            /scrape/image-file
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-500">{t('totalScraped')}</span>
          <span className="font-bold text-slate-900">{totalParsedCount}</span>
        </div>
      </div>
    </div>
  );
}
