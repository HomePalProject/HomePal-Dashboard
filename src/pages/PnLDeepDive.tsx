import { useState, useEffect, useCallback } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { PnLDeepDiveData, BillingLedgerRow } from '@typeDefs/pnlTypes';
import { MOCK_PNL_DATA } from '@constants/pnlData';

const statusStyles = {
  PAID: { bg: 'bg-status-success-container', text: 'text-status-success' },
  PENDING: { bg: 'bg-status-error-container', text: 'text-status-error' },
};

export default function PnLDeepDive() {
  const [data, setData] = useState<PnLDeepDiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('Last 12 Months');

  const [selectedInvoice, setSelectedInvoice] = useState<BillingLedgerRow | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const result = await analyticsService.getPnLDeepDive();
      setData(result || MOCK_PNL_DATA);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setData(MOCK_PNL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate processing
    if (!data) return;
    const headers = ['Service Provider', 'Category', 'Usage / Volume', 'Cost', 'Status'];
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
    showToast('Report exported successfully');
  };

  const handleRowClick = (row: BillingLedgerRow) => {
    setSelectedInvoice(row);
  };

  if (loading || !data) {
    return <div className="p-10 text-text-secondary">Loading analytics...</div>;
  }

  // Generate SVG path for a smooth curve (Spline interpolation approximation)
  const maxVal = 150; // Using 150 as max range for chart
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const generatePath = (points: number[]) => {
    const xStep = 900 / 11;
    let path = `M 0,${250 - (points[0] / maxVal) * 250}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = i * xStep;
      const y1 = 250 - (points[i] / maxVal) * 250;
      const x2 = (i + 1) * xStep;
      const y2 = 250 - (points[i + 1] / maxVal) * 250;

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
        <div className="w-6 h-6 bg-[#10a37f] rounded-sm flex items-center justify-center text-white">
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
        <div className="w-6 h-6 bg-[#ff9900] rounded-sm flex items-center justify-center text-white">
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
        <div className="w-6 h-6 bg-[#f43f5e] rounded-sm flex items-center justify-center text-white">
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
    return <div className="w-6 h-6 bg-[#cbd5e1] rounded-sm" />;
  };

  return (
    <div className="max-w-300 mx-auto flex flex-col gap-6 pb-15 font-sans">
      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary mb-2 font-medium tracking-wider uppercase">
            <span>Financial Operations</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight mb-2">
            P&L Deep-Dive
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 pr-8 rounded-sm border border-border text-[13px] text-text-primary bg-surface outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px top 50%',
              backgroundSize: '10px auto',
            }}
          >
            <option>Last 12 Months</option>
            <option>Last 6 Months</option>
            <option>Year to Date</option>
          </select>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-primary border-none rounded-sm text-[13px] font-semibold text-white cursor-pointer transition-opacity duration-200 hover:opacity-90',
              isExporting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <svg
                className="animate-spin w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
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
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-status-error bg-status-error-container rounded-sm border border-status-error/20">
          {error} (Showing fallback data)
        </div>
      )}

      {/* ── Top KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-surface rounded-md border border-border p-6 relative overflow-hidden">
          <div className="absolute right-6 top-6 opacity-10">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-text-secondary uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Monthly Recurring Revenue
          </div>
          <div className="text-[32px] font-extrabold text-text-primary mb-4">{data.mrr.value}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-status-success-container text-status-success rounded-full font-bold">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              {data.mrr.change}
            </span>
            <span className="text-text-secondary font-medium">vs last month</span>
          </div>
        </div>

        {/* AI Costs */}
        <div className="bg-surface rounded-md border border-border p-6">
          <div className="text-[11px] font-bold text-text-secondary uppercase mb-4">
            AI Infrastructure Costs
          </div>
          <div className="text-[32px] font-extrabold text-text-primary mb-4">
            {data.aiCosts.value}
          </div>
          <div className="flex items-center gap-2 text-xs text-status-error font-semibold">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {data.aiCosts.overage}
          </div>
        </div>

        {/* Net Margin (Solid Green) */}
        <div className="bg-primary rounded-md p-6 flex flex-col justify-center text-white">
          <div className="text-[11px] font-bold uppercase mb-3 opacity-90 tracking-wider">
            Net Margin
          </div>
          <div className="text-[32px] font-extrabold">{data.netMargin.value}</div>
        </div>

        {/* CAC */}
        <div className="bg-surface rounded-md border border-border p-6">
          <div className="text-[11px] font-bold text-text-secondary uppercase mb-4">
            Customer Acq. Cost
          </div>
          <div className="text-[32px] font-extrabold text-text-primary mb-4">{data.cac.value}</div>
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            Target: {data.cac.target}
            <div className="w-4.5 h-4.5 rounded-full border border-status-success flex items-center justify-center ml-auto">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-status-success"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="bg-surface rounded-md border border-border p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              Revenue vs. Operational Costs
            </h2>
            <p className="text-[13px] text-text-secondary">12-Month Historical Trend Analysis</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <span className="w-3 h-3 rounded-sm bg-primary" />
              Revenue
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <span className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
              Costs
            </div>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="relative h-70 w-full">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-7.5 flex flex-col justify-between text-text-secondary text-[11px] font-medium pr-4 border-r border-surface-variant">
            <span>$1.5M</span>
            <span>$1.0M</span>
            <span>$0.5M</span>
            <span>$0</span>
          </div>

          <div className="ml-12.5 h-62.5 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 border-b border-surface-variant top-0" />
            <div className="absolute inset-0 border-b border-surface-variant top-[33.33%]" />
            <div className="absolute inset-0 border-b border-surface-variant top-[66.66%]" />
            <div className="absolute inset-0 border-b border-surface-variant top-[100%]" />

            {/* SVG Chart */}
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 900 250"
            >
              <defs>
                <clipPath id="draw-animation-clip">
                  <rect x="0" y="-50" width="900" height="350">
                    <animate
                      attributeName="width"
                      from="0"
                      to="900"
                      dur="1.5s"
                      fill="freeze"
                      calcMode="spline"
                      keyTimes="0; 1"
                      keySplines="0.25 0.1 0.25 1"
                    />
                  </rect>
                </clipPath>
              </defs>
              <g clipPath="url(#draw-animation-clip)">
                {/* Cost Line (Dashed Orange) */}
                <path
                  d={costsPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Revenue Line (Solid Green) */}
                <path
                  d={revenuePath}
                  fill="none"
                  stroke="var(--sys-primary)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="ml-12.5 flex justify-between pt-4 text-text-secondary text-[11px] font-medium">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface rounded-md border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">Infrastructure Billing Ledger</h2>
          <button className="bg-transparent border-none text-text-secondary text-[13px] font-semibold cursor-pointer flex items-center gap-1 hover:text-text-primary transition-colors">
            View All
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-175">
            <thead>
              <tr className="bg-surface-variant/30 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase">
                  Service Provider
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase">
                  Usage / Volume
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase">
                  Cost
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase">
                  Status
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
                    className="border-b border-border cursor-pointer transition-colors hover:bg-surface-variant/50"
                  >
                    <td className="px-6 py-5 flex items-center gap-3">
                      {getProviderIcon(row.providerIcon)}
                      <span className="text-sm font-semibold text-text-primary">
                        {row.provider}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-text-secondary">{row.category}</td>
                    <td className="px-6 py-5 text-[13px] text-text-secondary">{row.usage}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-text-primary">
                      {row.cost}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide',
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

      {/* ── Invoice Modal ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          />

          {/* Modal Content */}
          <div className="relative bg-surface rounded-lg w-full max-w-125 shadow-2xl animate-[slideUp_0.3s_ease-out] overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:px-8 sm:py-6 border-b border-dashed border-border bg-surface-variant/30 flex justify-between items-start">
              <div className="flex items-center gap-4">
                {getProviderIcon(selectedInvoice.providerIcon)}
                <div>
                  <h2 className="text-xl font-extrabold text-text-primary mb-1">
                    {selectedInvoice.provider}
                  </h2>
                  <div className="text-[13px] text-text-secondary font-medium">
                    Invoice #INV-{selectedInvoice.id}08492
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex px-3 py-1.5 rounded-full text-xs font-bold tracking-wide',
                  statusStyles[selectedInvoice.status].bg,
                  statusStyles[selectedInvoice.status].text
                )}
              >
                {selectedInvoice.status}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="flex justify-between mb-6">
                <div>
                  <div className="text-xs text-text-secondary font-semibold uppercase mb-1">
                    Date of Issue
                  </div>
                  <div className="text-sm font-semibold text-text-primary">Oct 24, 2026</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-secondary font-semibold uppercase mb-1">
                    Billing Period
                  </div>
                  <div className="text-sm font-semibold text-text-primary">
                    Sep 1 - Sep 30, 2026
                  </div>
                </div>
              </div>

              <div className="bg-surface-variant/30 rounded-md p-5 mb-6 border border-border">
                <div className="flex justify-between border-b border-border pb-3 mb-3">
                  <span className="text-sm text-text-secondary font-medium">Category</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {selectedInvoice.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary font-medium">Usage / Volume</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {selectedInvoice.usage}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center px-5 py-4 bg-text-primary text-white rounded-md">
                <span className="text-sm font-semibold">Total Amount</span>
                <span className="text-2xl font-extrabold">{selectedInvoice.cost}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-border flex justify-end bg-surface-variant/20">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 bg-surface border border-border rounded-sm text-[13px] font-semibold cursor-pointer text-text-primary transition-colors hover:bg-surface-variant"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-sm text-[13px] font-medium shadow-lg flex items-center gap-2 z-[9999] animate-[slideUp_0.3s_ease-out]">
          <svg
            className="w-4 h-4 text-status-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
