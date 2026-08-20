import { useState, useEffect, useCallback } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { PnLDeepDiveData, BillingLedgerRow } from '@typeDefs/pnlTypes';
import { Button } from '@components/ui/Button';
import { useTranslation } from 'react-i18next';

const statusStyles = {
  PAID: { bg: 'bg-status-success-container', text: 'text-status-success' },
  PENDING: { bg: 'bg-status-error-container', text: 'text-status-error' },
};

export default function PnLDeepDive() {
  const { t, i18n } = useTranslation('stats');
  const [data, setData] = useState<PnLDeepDiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'last12Months' | 'last6Months' | 'yearToDate'>(
    'last12Months'
  );

  // TODO: Re-enable when backend provides /analytics/billing-ledger endpoint
  // const [selectedInvoice, setSelectedInvoice] = useState<BillingLedgerRow | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const [revRes, tokenRes] = await Promise.all([
        analyticsService.getRevenue().catch(() => null),
        analyticsService.getTokenUsage().catch(() => null),
      ]);

      const rev = revRes?.monthlyRevenue ?? 0;
      const cost = tokenRes?.totalCost ?? 0;
      const subs = revRes?.activeSubscribers ?? 0;

      // Net margin calculation
      let netMarginPerc = 0;
      if (rev > 0) {
        netMarginPerc = ((rev - cost) / rev) * 100;
      } else if (cost > 0) {
        netMarginPerc = -100;
      }

      // Cost per subscriber
      const costPerSub = subs > 0 ? cost / subs : 0;

      // Construct dynamic chart data
      const monthlyTrends = revRes?.monthlyTrend ?? [];
      const revenuePoints = monthlyTrends.map((m) => m.revenue);
      const costPoints = monthlyTrends.map(() => cost / 12);

      // Fallback if no chart data
      const finalRevPoints =
        revenuePoints.length > 0 ? revenuePoints : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const finalCostPoints =
        costPoints.length > 0 ? costPoints : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      // Dynamic Ledger
      const totalTokens = (tokenRes?.inputTokens || 0) + (tokenRes?.outputTokens || 0);

      const computedData: PnLDeepDiveData = {
        mrr: { value: t('currencyValue', { value: rev.toLocaleString() }), change: '+0.0%' },
        aiCosts: {
          value: t('currencyValue', { value: cost.toLocaleString() }),
          overage: t('liveSynced'),
        },
        netMargin: { value: `${netMarginPerc.toFixed(1)}%` },
        cac: {
          value: t('currencyValue', { value: costPerSub.toFixed(2) }),
          target: t('costPerActiveSub'),
        },
        chartData: {
          revenue: finalRevPoints,
          costs: finalCostPoints,
        },
        // TODO: Awaiting backend endpoint GET /analytics/billing-ledger for multi-provider support
        // billingLedger: [
        //   {
        //     id: '1',
        //     provider: 'OpenAI API',
        //     providerIcon: 'openai',
        //     category: t('categoryLlmInference'),
        //     usage: `${totalTokens > 0 ? (totalTokens / 1000000).toFixed(2) + 'M' : '0'} ${t('tokensLabel')}`,
        //     cost: t('currencyValue', { value: cost.toLocaleString() }),
        //     status: 'PAID',
        //   },
        // ],
        billingLedger: [],
      };

      setData(computedData);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [t, i18n.language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate processing
    if (!data) return;
    const headers = [
      t('thServiceProviderCsv'),
      t('thCategory'),
      t('thUsageVolumeCsv'),
      t('thCostCsv'),
      t('thStatus'),
    ];
    const csvContent = [
      headers.join(','),
      ...data.billingLedger.map((r) =>
        [`"${r.provider}"`, `"${r.category}"`, `"${r.usage}"`, `"${r.cost}"`, r.status].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'billing_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
    showToast(t('toastReportExported'));
  };

  // TODO: Re-enable when backend provides /analytics/billing-ledger endpoint
  // const handleRowClick = (row: BillingLedgerRow) => {
  //   setSelectedInvoice(row);
  // };

  if (loading || !data) {
    return <div className="p-40 text-text-secondary">{t('loadingLedger')}</div>;
  }

  // Generate SVG path for a smooth curve (Spline interpolation approximation)
  const months = t('months', { returnObjects: true }) as string[];

  const generatePath = (points: number[]) => {
    if (!points || points.length === 0) return 'M 0,250';
    // Dynamically calculate maxVal based on actual data to scale the chart appropriately
    const actualMax = Math.max(...points, 100);
    const scaleMax = actualMax * 1.2; // Add 20% headroom

    const xStep = 900 / Math.max(1, points.length - 1);
    let path = `M 0,${250 - (points[0] / scaleMax) * 250}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = i * xStep;
      const y1 = 250 - (points[i] / scaleMax) * 250;
      const x2 = (i + 1) * xStep;
      const y2 = 250 - (points[i + 1] / scaleMax) * 250;

      const cx1 = x1 + xStep / 2;
      const cy1 = y1;
      const cx2 = x1 + xStep / 2;
      const cy2 = y2;

      path += ` C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
    }
    return path;
  };

  const revenuePath = generatePath(data.chartData.revenue);
  const costsPath = generatePath(data.chartData.costs);

  const getProviderIcon = (icon: string) => {
    if (icon === 'openai')
      return (
        <div className="w-24 h-24 bg-[#10a37f] rounded-sm flex items-center justify-center text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
      );
    if (icon === 'aws')
      return (
        <div className="w-24 h-24 bg-[#ff9900] rounded-sm flex items-center justify-center text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
          </svg>
        </div>
      );
    if (icon === 'pinecone')
      return (
        <div className="w-24 h-24 bg-[#f43f5e] rounded-sm flex items-center justify-center text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      );
    return <div className="w-24 h-24 bg-[#cbd5e1] rounded-sm" />;
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1 font-semibold tracking-widest uppercase">
            <span>{t('operationsAndFinance')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t('infrastructureLedger')}
          </h1>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={timeFilter}
            onChange={(e) =>
              setTimeFilter(e.target.value as 'last12Months' | 'last6Months' | 'yearToDate')
            }
            className="pl-4 pr-10 py-2.5 rounded-xl border border-border text-sm font-medium text-text-primary bg-surface outline-none cursor-pointer shadow-sm appearance-none focus:ring-2 focus:ring-primary/20 transition-all"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition:
                i18n.resolvedLanguage === 'ar' ? 'left 12px top 50%' : 'right 12px top 50%',
              backgroundSize: '10px auto',
            }}
          >
            <option value="last12Months">{t('last12Months')}</option>
            <option value="last6Months">{t('last6Months')}</option>
            <option value="yearToDate">{t('yearToDate')}</option>
          </select>
          <Button onClick={handleExportCSV} disabled={isExporting} isLoading={isExporting}>
            {t('exportReport')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-status-error bg-status-error-container rounded-lg border border-status-error/20">
          {t('errFallback', { error })}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-variant/10 flex flex-col">
          <div className="p-6 border-b border-border bg-primary text-white">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
              {t('netMarginTitle')}
            </div>
            <div className="text-4xl font-mono font-bold tracking-tight">
              {data.netMargin.value}
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {t('totalRevenue')}
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">{data.mrr.value}</div>
          </div>

          <div className="p-6 border-b border-border bg-status-error-container/20">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {t('aiInfrastructure')}
            </div>
            <div className="text-2xl font-mono font-bold text-status-error">
              {data.aiCosts.value}
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {t('costPerActiveSub')}
            </div>
            <div className="text-xl font-mono font-semibold text-text-primary">
              {data.cac.value}
            </div>
            <div className="text-xs text-text-secondary mt-1">{t('avgComputeSpend')}</div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-text-primary">{t('revenueVsCostTrend')}</h2>
              <p className="text-xs text-text-secondary mt-0.5">{t('rolling12MonthWindow')}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                {t('revenueLabel')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                {t('costsLabel')}
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-[220px] w-full flex flex-col">
            <div className="absolute start-0 top-0 bottom-8 flex flex-col justify-between text-text-secondary text-xs font-mono font-medium pe-3 border-e border-border w-12">
              <span>$1.5M</span>
              <span>$1.0M</span>
              <span>$0.5M</span>
              <span>$0</span>
            </div>

            <div className="flex-1 ms-12 relative">
              <div className="absolute inset-0 border-b border-surface-variant top-0" />
              <div className="absolute inset-0 border-b border-surface-variant top-[33.33%]" />
              <div className="absolute inset-0 border-b border-surface-variant top-[66.66%]" />
              <div className="absolute inset-0 border-b border-border top-full" />

              <svg
                className="absolute inset-0 w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 900 250"
              >
                <defs>
                  <clipPath id="chart-clip">
                    <rect x="0" y="-50" width="900" height="350">
                      <animate
                        attributeName="width"
                        from="0"
                        to="900"
                        dur="1.2s"
                        fill="freeze"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.25 0.1 0.25 1"
                      />
                    </rect>
                  </clipPath>
                </defs>
                <g clipPath="url(#chart-clip)">
                  <path
                    d={costsPath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={revenuePath}
                    fill="none"
                    stroke="var(--sys-primary)"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              </svg>
            </div>

            <div className="ml-12 flex justify-between pt-2 pb-1 text-text-secondary text-xs font-mono font-medium">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Uncomment when backend provides /analytics/billing-ledger endpoint
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-variant/30">
          <h2 className="text-sm font-bold text-text-primary">{t('monthlyComputeInvoices')}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start min-w-175">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {t('thService')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {t('thCategory')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {t('thUsageVolume')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider text-end">
                  {t('thAmount')}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">
                  {t('thStatus')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.billingLedger.map((row) => {
                const sStyle = statusStyles[row.status];
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="border-b border-border cursor-pointer transition-colors hover:bg-surface-variant/50 even:bg-surface-variant/20"
                  >
                    <td className="px-6 py-3 flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 rounded-1 overflow-hidden">
                        {getProviderIcon(row.providerIcon)}
                      </div>
                      <span className="text-xs font-semibold text-text-primary">
                        {row.provider}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-text-secondary">{row.category}</td>
                    <td className="px-6 py-3 text-xs font-mono text-text-secondary">{row.usage}</td>
                    <td className="px-6 py-3 text-xs font-mono font-bold text-text-primary text-end">
                      {row.cost}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest',
                          sStyle.bg,
                          sStyle.text
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      */}

      {/* TODO: Uncomment when backend provides /analytics/billing-ledger endpoint
      {selectedInvoice && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          />
          <div className="relative bg-surface rounded-2xl w-full max-w-md shadow-2xl animate-[slideUp_0.2s_ease-out] overflow-hidden border border-border">
            <div className="p-6 border-b border-dashed border-border bg-surface-variant/30 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
                  {getProviderIcon(selectedInvoice.providerIcon)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary leading-tight">
                    {selectedInvoice.provider}
                  </h2>
                  <div className="text-xs font-mono text-text-secondary mt-0.5">
                    INV-{selectedInvoice.id}08492
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-widest',
                  statusStyles[selectedInvoice.status].bg,
                  statusStyles[selectedInvoice.status].text
                )}
              >
                {selectedInvoice.status}
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <div className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">
                    {t('issueDate')}
                  </div>
                  <div className="text-xs font-mono font-semibold text-text-primary">
                    Oct 24, 2026
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">
                    {t('period')}
                  </div>
                  <div className="text-xs font-mono font-semibold text-text-primary">
                    Sep 1 - Sep 30
                  </div>
                </div>
              </div>
              <div className="bg-surface-variant/40 rounded-xl p-4 mb-6 border border-border">
                <div className="flex justify-between border-b border-border pb-3 mb-3">
                  <span className="text-xs text-text-secondary font-medium">{t('thCategory')}</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {selectedInvoice.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-secondary font-medium">{t('usageLabel')}</span>
                  <span className="text-xs font-mono font-semibold text-text-primary">
                    {selectedInvoice.usage}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-text-primary text-white rounded-xl shadow-inner">
                <span className="text-xs font-bold uppercase tracking-wide opacity-90">
                  {t('totalDue')}
                </span>
                <span className="text-xl font-mono font-bold">{selectedInvoice.cost}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end bg-surface-variant/20">
              <Button onClick={() => setSelectedInvoice(null)} variant="secondary">
                {t('closeInvoice')}
              </Button>
            </div>
          </div>
        </div>
      )}
      */}

      {toastMessage && (
        <div className="fixed bottom-6 inset-e-6 bg-text-primary text-white px-4 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 z-[9999] animate-[slideUp_0.2s_ease-out]">
          <svg
            className="w-4 h-4 text-status-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
