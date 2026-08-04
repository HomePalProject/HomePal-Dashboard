import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface BillingLedgerRow {
  id: string;
  provider: string;
  providerIcon: string;
  category: string;
  usage: string;
  cost: string;
  status: 'PAID' | 'PENDING';
}

interface PnLDeepDiveData {
  mrr: { value: string; change: string };
  aiCosts: { value: string; overage: string };
  netMargin: { value: string };
  cac: { value: string; target: string };
  chartData: { revenue: number[]; costs: number[] }; // Mock values for the 12 months
  billingLedger: BillingLedgerRow[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { data: null, error: json?.message ?? `Request failed (${res.status})` };
    }
    const data = json?.data !== undefined ? json.data : (json as T);
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

// ── Components ───────────────────────────────────────────────────────────────

const statusStyles = {
  PAID: { bg: '#d1fae5', color: '#10b981' },
  PENDING: { bg: '#fee2e2', color: '#ef4444' },
};

export default function PnLDeepDive() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<PnLDeepDiveData | null>(null);
  const [loading, setLoading] = useState(true);

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
    const res = await apiFetch<PnLDeepDiveData>('/api/analytics/pnl-deep-dive', token);

    if (res.data) {
      setData(res.data);
    } else {
      // MOCK DATA FALLBACK
      setData({
        mrr: { value: '$1.24M', change: '+12.4%' },
        aiCosts: { value: '$248K', overage: '+5.2% Overage' },
        netMargin: { value: '28.4%' },
        cac: { value: '$412.00', target: '$450' },
        chartData: {
          revenue: [20, 25, 32, 45, 55, 62, 70, 80, 95, 110, 120, 130],
          costs: [10, 12, 14, 18, 22, 30, 32, 28, 25, 20, 50, 45], // Spline path estimation
        },
        billingLedger: [
          {
            id: '1',
            provider: 'OpenAI API',
            providerIcon: 'openai',
            category: 'LLM Inference',
            usage: '42.5M Tokens',
            cost: '$8,450.00',
            status: 'PAID',
          },
          {
            id: '2',
            provider: 'AWS Compute',
            providerIcon: 'aws',
            category: 'EC2 Instances',
            usage: '1,240 Hours',
            cost: '$3,120.50',
            status: 'PAID',
          },
          {
            id: '3',
            provider: 'Pinecone DB',
            providerIcon: 'pinecone',
            category: 'Vector Storage',
            usage: '200GB (Overage)',
            cost: '$1,450.00',
            status: 'PENDING',
          },
        ],
      });
    }
    setLoading(false);
  }, [token]);

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
    return (
      <div style={{ padding: 40, color: 'var(--sys-text-secondary)' }}>Loading analytics...</div>
    );
  }

  // Generate SVG path for a smooth curve (Spline interpolation approximation)
  // X values from 0 to 900
  // Y values from 250 down to 0
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
        <div
          style={{
            width: 24,
            height: 24,
            background: '#10a37f',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
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
        <div
          style={{
            width: 24,
            height: 24,
            background: '#ff9900',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
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
        <div
          style={{
            width: 24,
            height: 24,
            background: '#f43f5e',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
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
    return <div style={{ width: 24, height: 24, background: '#cbd5e1', borderRadius: 4 }} />;
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 60,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--sys-text-secondary)',
              marginBottom: 8,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span>Financial Operations</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            P&L Deep-Dive
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: '8px 32px 8px 16px',
              borderRadius: 8,
              border: '1px solid var(--sys-border)',
              fontSize: 13,
              color: 'var(--sys-text-primary)',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'var(--sys-primary)',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isExporting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isExporting) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!isExporting) e.currentTarget.style.opacity = '1';
            }}
          >
            {isExporting ? (
              <svg
                style={{ animation: 'spin 1s linear infinite' }}
                width="16"
                height="16"
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

      {/* ── Top KPI Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto 1fr', gap: 20 }}>
        {/* MRR */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: 24, top: 24, opacity: 0.1 }}>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--sys-text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sys-primary)' }}
            />
            Monthly Recurring Revenue
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              marginBottom: 16,
            }}
          >
            {data.mrr.value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: '#d1fae5',
                color: '#10b981',
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
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
            <span style={{ color: 'var(--sys-text-secondary)', fontWeight: 500 }}>
              vs last month
            </span>
          </div>
        </div>

        {/* AI Costs */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--sys-text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            AI Infrastructure Costs
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              marginBottom: 16,
            }}
          >
            {data.aiCosts.value}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#ef4444',
              fontWeight: 600,
            }}
          >
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
        <div
          style={{
            background: 'var(--sys-primary)',
            borderRadius: 12,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#fff',
            minWidth: 160,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 12,
              opacity: 0.9,
              letterSpacing: '0.05em',
            }}
          >
            Net Margin
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{data.netMargin.value}</div>
        </div>

        {/* CAC */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--sys-text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Customer Acq. Cost
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              marginBottom: 16,
            }}
          >
            {data.cac.value}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--sys-text-secondary)',
            }}
          >
            Target: {data.cac.target}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--sys-border)',
          padding: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--sys-text-primary)',
                marginBottom: 4,
              }}
            >
              Revenue vs. Operational Costs
            </h2>
            <p style={{ fontSize: 13, color: 'var(--sys-text-secondary)' }}>
              12-Month Historical Trend Analysis
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--sys-text-secondary)',
              }}
            >
              <span
                style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--sys-primary)' }}
              />
              Revenue
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--sys-text-secondary)',
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#f59e0b' }} />
              Costs
            </div>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div style={{ position: 'relative', height: 280, width: '100%' }}>
          {/* Y-Axis Labels */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 30,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: 'var(--sys-text-secondary)',
              fontSize: 11,
              fontWeight: 500,
              paddingRight: 16,
              borderRight: '1px solid #f4f4f5',
            }}
          >
            <span>$1.5M</span>
            <span>$1.0M</span>
            <span>$0.5M</span>
            <span>$0</span>
          </div>

          <div style={{ marginLeft: 50, height: 250, position: 'relative' }}>
            {/* Grid lines */}
            <div
              style={{ position: 'absolute', inset: 0, borderBottom: '1px solid #f4f4f5', top: 0 }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderBottom: '1px solid #f4f4f5',
                top: '33.33%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderBottom: '1px solid #f4f4f5',
                top: '66.66%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderBottom: '1px solid #f4f4f5',
                top: '100%',
              }}
            />

            {/* SVG Chart */}
            <svg
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
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
          <div
            style={{
              marginLeft: 50,
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 16,
              color: 'var(--sys-text-secondary)',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--sys-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--sys-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
            Infrastructure Billing Ledger
          </h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sys-text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
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

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fdf8f4', borderBottom: '1px solid var(--sys-border)' }}>
              <th
                style={{
                  padding: '16px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Service Provider
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Usage / Volume
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Cost
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--sys-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.billingLedger.map((row) => {
              const statusStyle = statusStyles[row.status];
              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--sys-border)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    {getProviderIcon(row.providerIcon)}
                    <span
                      style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}
                    >
                      {row.provider}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '20px 24px',
                      fontSize: 13,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    {row.category}
                  </td>
                  <td
                    style={{
                      padding: '20px 24px',
                      fontSize: 13,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    {row.usage}
                  </td>
                  <td
                    style={{
                      padding: '20px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                    }}
                  >
                    {row.cost}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '4px 10px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: 16,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                      }}
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

      {/* ── Invoice Modal ───────────────────────────────────────────────── */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSelectedInvoice(null)}
          />

          {/* Modal Content */}
          <div
            className="print-modal"
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 16,
              width: '90%',
              maxWidth: 500,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 32px',
                borderBottom: '1px dashed var(--sys-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: '#fdf8f4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {getProviderIcon(selectedInvoice.providerIcon)}
                <div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--sys-text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    {selectedInvoice.provider}
                  </h2>
                  <div
                    style={{ fontSize: 13, color: 'var(--sys-text-secondary)', fontWeight: 500 }}
                  >
                    Invoice #INV-{selectedInvoice.id}08492
                  </div>
                </div>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  background: statusStyles[selectedInvoice.status].bg,
                  color: statusStyles[selectedInvoice.status].color,
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {selectedInvoice.status}
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--sys-text-secondary)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Date of Issue
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                    Oct 24, 2026
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--sys-text-secondary)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Billing Period
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                    Sep 1 - Sep 30, 2026
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 24,
                  border: '1px solid var(--sys-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: 'var(--sys-text-secondary)', fontWeight: 500 }}
                  >
                    Category
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                    {selectedInvoice.category}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span
                    style={{ fontSize: 14, color: 'var(--sys-text-secondary)', fontWeight: 500 }}
                  >
                    Usage / Volume
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                    {selectedInvoice.usage}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'var(--sys-text-primary)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>Total Amount</span>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{selectedInvoice.cost}</span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '20px 32px',
                borderTop: '1px solid var(--sys-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#fafafa',
              }}
            >
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  border: '1px solid var(--sys-border)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--sys-text-primary)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: '#111827',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 9999,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
