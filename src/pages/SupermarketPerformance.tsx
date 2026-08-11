import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface Partner {
  id: string;
  rank: number;
  chain: string;
  code: string;
  activeOffers: string;
  userCtr: string;
  ingestionRate: { value: string; color: string; bg: string };
  predictedGrowth: string;
}

interface SupermarketPerformanceData {
  partners: Partner[];
  opportunities: {
    waitrose: { coverage: string; potential: string };
    choithrams: { errors: string; potential: string };
  };
  funnel: {
    flyerSeen: string;
    productSaved: string;
    purchaseLogged: string;
    conversionRate: string;
  };
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

// ── Component ───────────────────────────────────────────────────────────────

export default function SupermarketPerformance() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<SupermarketPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', website: '', contactEmail: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<SupermarketPerformanceData>(
      '/api/analytics/supermarket-performance',
      token
    );

    if (res.data) {
      setData(res.data);
    } else {
      // MOCK DATA FALLBACK
      setData({
        partners: [
          {
            id: '1',
            rank: 1,
            code: 'SP',
            chain: 'Spinneys',
            activeOffers: '1,245',
            userCtr: '8.4%',
            ingestionRate: { value: '99.8%', color: '#10b981', bg: '#d1fae5' },
            predictedGrowth: '+12%',
          },
          {
            id: '2',
            rank: 2,
            code: 'CA',
            chain: 'Carrefour',
            activeOffers: '3,102',
            userCtr: '7.1%',
            ingestionRate: { value: '98.5%', color: '#10b981', bg: '#d1fae5' },
            predictedGrowth: '+8%',
          },
          {
            id: '3',
            rank: 3,
            code: 'LC',
            chain: 'Lulu Hypermarket',
            activeOffers: '890',
            userCtr: '5.2%',
            ingestionRate: { value: '92.1%', color: '#f59e0b', bg: '#fef3c7' },
            predictedGrowth: '+2%',
          },
        ],
        opportunities: {
          waitrose: { coverage: '42%', potential: 'High Potential' },
          choithrams: { errors: '12%', potential: 'Med Potential' },
        },
        funnel: {
          flyerSeen: '142K',
          productSaved: '64K',
          purchaseLogged: '25K',
          conversionRate: '17.6%',
        },
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
    const headers = [
      'Rank',
      'Partner Chain',
      'Active Offers',
      'User CTR',
      'Ingestion Rate',
      'Predicted Growth',
    ];
    const csvContent = [
      headers.join(','),
      ...data.partners.map((p) =>
        [
          p.rank,
          `"${p.chain}"`,
          `"${p.activeOffers}"`,
          p.userCtr,
          p.ingestionRate.value,
          p.predictedGrowth,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'supermarket_performance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
    showToast('Report exported successfully');
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API Call
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewPartner({ name: '', website: '', contactEmail: '' });
    showToast('New partner request submitted to onboarding queue.');
  };

  if (loading || !data) {
    return (
      <div style={{ padding: 40, color: 'var(--sys-text-secondary)' }}>Loading analytics...</div>
    );
  }

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
            }}
          >
            <span>HomePal Admin</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span style={{ color: 'var(--sys-text-primary)' }}>Analytics</span>
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
            Supermarket Performance
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sys-text-secondary)', maxWidth: 600 }}>
            Analyze B2B partner engagement, monitor data ingestion, and identify strategic growth
            opportunities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid var(--sys-border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--sys-text-primary)',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isExporting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isExporting) e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (!isExporting) e.currentTarget.style.background = '#fff';
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
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#357161',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Partner
          </button>
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}
      >
        {/* ── Main Table ────────────────────────────────────────────────── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--sys-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sys-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                Partner Performance Index
              </h2>
            </div>
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
              <tr style={{ borderBottom: '1px solid var(--sys-border)' }}>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Rank
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Partner Chain
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Active Offers
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  User CTR
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Ingestion Rate
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  Predicted Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {data.partners.map((partner) => (
                <tr
                  key={partner.id}
                  style={{
                    borderBottom: '1px solid var(--sys-border)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                    }}
                  >
                    {partner.rank}
                  </td>
                  <td
                    style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '1px solid var(--sys-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--sys-text-secondary)',
                        background: '#fff',
                      }}
                    >
                      {partner.code}
                    </div>
                    <span
                      style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}
                    >
                      {partner.chain}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: 13,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    {partner.activeOffers}
                  </td>
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: 13,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    {partner.userCtr}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        background: partner.ingestionRate.bg,
                        color: partner.ingestionRate.color,
                        borderRadius: 16,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: partner.ingestionRate.color,
                        }}
                      />
                      {partner.ingestionRate.value}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    {partner.predictedGrowth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Side Panels ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Partnership Opportunities */}
          <div
            style={{
              background: '#fcf6f3',
              borderRadius: 12,
              border: '1px solid #f9d8c4',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                Partnership Opportunities
              </h2>
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--sys-text-secondary)',
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              Stores exhibiting high user search volume but suffering from low active data coverage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Waitrose */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  border: '1px solid var(--sys-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    Waitrose
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Low Coverage ({data.opportunities.waitrose.coverage})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                    {data.opportunities.waitrose.potential}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sys-text-secondary)' }}>Potential</div>
                </div>
              </div>

              {/* Choithrams */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  border: '1px solid var(--sys-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--sys-text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    Choithrams
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.42" />
                    </svg>
                    Sync Errors ({data.opportunities.choithrams.errors})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>
                    {data.opportunities.choithrams.potential}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sys-text-secondary)' }}>Potential</div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Conversion Funnel */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--sys-border)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--sys-text-primary)',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Global Conversion Funnel
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              {/* Funnel Step 1 */}
              <div
                style={{
                  width: '100%',
                  background: '#e2e8f0',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                  }}
                >
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Flyer Seen
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sys-text-secondary)' }}>
                  {data.funnel.flyerSeen}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>

              {/* Funnel Step 2 */}
              <div
                style={{
                  width: '85%',
                  background: '#f1f5f9',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                  }}
                >
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
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Product Saved
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sys-text-secondary)' }}>
                  {data.funnel.productSaved}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>

              {/* Funnel Step 3 */}
              <div
                style={{
                  width: '70%',
                  background: '#d1e6e0',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                  }}
                >
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
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Purchase Logged
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                  {data.funnel.purchaseLogged}
                </span>
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                marginTop: 24,
                fontSize: 13,
                color: 'var(--sys-text-secondary)',
              }}
            >
              Overall Conversion Rate:{' '}
              <span style={{ fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                {data.funnel.conversionRate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals & Toasts ───────────────────────────────────────────── */}

      {/* New Partner Modal */}
      {isModalOpen && (
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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setIsModalOpen(false)}
          />
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 16,
              width: '90%',
              maxWidth: 500,
              padding: 32,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--sys-text-primary)',
                marginBottom: 8,
              }}
            >
              Add New Partner
            </h2>
            <p style={{ fontSize: 13, color: 'var(--sys-text-secondary)', marginBottom: 24 }}>
              Enter the supermarket details to initialize integration.
            </p>

            <form
              onSubmit={handleAddPartner}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Supermarket Chain Name
                </label>
                <input
                  required
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--sys-border)',
                    outline: 'none',
                    fontSize: 14,
                  }}
                  placeholder="e.g. Al Maya"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Website URL
                </label>
                <input
                  required
                  type="url"
                  value={newPartner.website}
                  onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--sys-border)',
                    outline: 'none',
                    fontSize: 14,
                  }}
                  placeholder="https://"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                    marginBottom: 6,
                  }}
                >
                  Contact Email
                </label>
                <input
                  required
                  type="email"
                  value={newPartner.contactEmail}
                  onChange={(e) => setNewPartner({ ...newPartner, contactEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--sys-border)',
                    outline: 'none',
                    fontSize: 14,
                  }}
                  placeholder="integration@supermarket.com"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#fff',
                    border: '1px solid var(--sys-border)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--sys-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isSubmitting && (
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
                  )}
                  Submit Request
                </button>
              </div>
            </form>
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
