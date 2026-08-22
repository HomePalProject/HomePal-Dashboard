import { useEffect, useState } from 'react';
import { analyticsService } from '@services/analyticsService';
import type { TokenUsageMetrics } from '@typeDefs/tokenUsageTypes';
import { useTranslation } from 'react-i18next';

export default function TokenUsage() {
  const { t } = useTranslation('tokenUsage');
  const [data, setData] = useState<TokenUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    let mounted = true;
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const toTimestamp = new Date().toISOString();
        const fromTimestamp = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const res = await analyticsService.getTokenUsage(fromTimestamp, toTimestamp);
        if (mounted) setData(res);
      } catch (error) {
        console.error('Failed to fetch token usage:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchUsage();
    return () => {
      mounted = false;
    };
  }, [days]);

  const totalTokens = data?.totalTokens ?? 0;
  const inputTokens = data?.inputTokens ?? 0;
  const outputTokens = data?.outputTokens ?? 0;
  const totalCost = data?.totalCost ?? 0;

  const inputPercentage = totalTokens > 0 ? Math.round((inputTokens / totalTokens) * 100) : 0;
  const outputPercentage = totalTokens > 0 ? 100 - inputPercentage : 0;

  return (
    <div className="w-full space-y-6 font-sans pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>{t('analyticsAndPerformance')}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rtl:rotate-180"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-slate-900 font-bold">{t('aiTokenUsageAndSpend')}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 m-0">{t('title')}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 mt-4 sm:mt-0">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
          >
            <option value={1}>{t('last24Hours')}</option>
            <option value={7}>{t('last7Days')}</option>
            <option value={30}>{t('last30Days')}</option>
          </select>

          <button
            onClick={() => {
              const csv = `Metric,Value\nTotal Tokens,${totalTokens}\nInput Tokens,${inputTokens}\nOutput Tokens,${outputTokens}\nTotal Cost USD,$${totalCost.toFixed(2)}`;
              const blob = new Blob([csv], { type: 'text/csv' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `token_usage_summary_${days}d.csv`;
              link.click();
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white border-none rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors shadow-xs flex-1 sm:flex-none"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('exportCsv')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-semibold text-slate-400 bg-white rounded-2xl border border-slate-200">
          {t('loading')}
        </div>
      ) : (
        <>
          {/* ── KPI Metric Cards (Live Endpoint Data) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tokens */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('totalTokens')}
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {totalTokens.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                  <span className="text-emerald-600 font-bold">{t('liveApiData')}</span>
                  <span>• {t('dayWindow', { count: days })}</span>
                </div>
              </div>
            </div>

            {/* Input Tokens */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('inputPromptTokens')}
                </span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v12" />
                    <path d="m8 11 4 4 4-4" />
                    <path d="M4 21h16" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {inputTokens.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                  <span className="text-blue-600 font-bold">{inputPercentage}%</span>
                  <span>{t('ofTotalVolume')}</span>
                </div>
              </div>
            </div>

            {/* Output Tokens */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('outputCompletionTokens')}
                </span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 17V5" />
                    <path d="m8 9 4-4 4 4" />
                    <path d="M4 21h16" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {outputTokens.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                  <span className="text-purple-600 font-bold">{outputPercentage}%</span>
                  <span>{t('completionRatio')}</span>
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('totalApiCost')}
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  ${totalCost.toFixed(2)} USD
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                  <span className="text-amber-600 font-bold">{t('apiVerified')}</span>
                  <span>{t('realTimeCompute')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Visual Consumption Ratio & Pipeline Telemetry ── */}
          <div className="w-full">
            {/* Input vs Output Visual Progress Bar */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">
                    {t('tokenDistributionRatio')}
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    {t('tokenDistributionSubtitle')}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
                  {inputPercentage}% / {outputPercentage}%
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5">
                  <div
                    style={{ width: `${inputPercentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${outputPercentage}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-700">
                      {t('inputPromptsTokens', { tokens: inputTokens.toLocaleString() })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                    <span className="font-semibold text-slate-700">
                      {t('outputCompletionsTokens', { tokens: outputTokens.toLocaleString() })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
