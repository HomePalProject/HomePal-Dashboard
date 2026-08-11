import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  revenue: { current: number; changePercentage: number };
  serverCosts: { current: number; changePercentage: number };
  netMargin: { current: number; changePercentage: number };
  topSupermarketChains: { name: string; value: number }[];
  visionHealth: {
    autoParsedPercentage: number;
    manualFallbackPercentage: number;
    failedPercentage: number;
  };
  userDistribution: { region: string; households: number; lat: number; lng: number }[];
  topCategories: { name: string; percentage: number }[];
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

function StatCard({
  title,
  value,
  change,
  isCurrency = false,
  isPercent = false,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  change: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const isPositive = change > 0;

  // Format values
  const displayValue = isCurrency
    ? `$${(value / 1000).toFixed(1)}k`
    : isPercent
      ? `${value}%`
      : value.toLocaleString();

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid var(--sys-border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'all 0.2s' : 'none',
      }}
      onMouseEnter={
        onClick
          ? (e) => (e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
          : undefined
      }
      onMouseLeave={onClick ? (e) => (e.currentTarget.style.boxShadow = 'none') : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--sys-text-secondary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <div style={{ color: 'var(--sys-primary)' }}>{icon}</div>
      </div>

      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--sys-text-primary)' }}>
        {displayValue}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: isPositive ? 'var(--sys-primary)' : 'var(--sys-status-error)',
            fontWeight: 700,
          }}
        >
          {isPositive ? (
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
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {Math.abs(change)}%
        </span>
        <span style={{ color: 'var(--sys-text-secondary)', fontWeight: 500 }}>vs last month</span>
      </div>
    </div>
  );
}

export default function Stats() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<AnalyticsData>('/api/analytics/overview', token);

    if (res.data) {
      setData(res.data);
    } else {
      // MOCK DATA FALLBACK (Matching Screenshot)
      setData({
        revenue: { current: 245800, changePercentage: 12.5 },
        serverCosts: { current: 42100, changePercentage: 3.2 },
        netMargin: { current: 38.4, changePercentage: 1.8 },
        topSupermarketChains: [
          { name: 'Chain A', value: 100 },
          { name: 'Chain B', value: 75 },
          { name: 'Chain C', value: 50 },
          { name: 'Chain D', value: 30 },
          { name: 'Chain E', value: 20 },
        ],
        visionHealth: {
          autoParsedPercentage: 94.2,
          manualFallbackPercentage: 4.5,
          failedPercentage: 1.3,
        },
        userDistribution: [
          { region: 'North', households: 1, lat: 20, lng: 30 },
          { region: 'South', households: 1, lat: 60, lng: 70 },
          { region: 'West', households: 1, lat: 45, lng: 20 },
        ],
        topCategories: [
          { name: 'Fresh Produce', percentage: 32 },
          { name: 'Dairy & Eggs', percentage: 24 },
          { name: 'Meat & Seafood', percentage: 18 },
          { name: 'Pantry Staples', percentage: 15 },
        ],
      });
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div style={{ padding: 40, color: 'var(--sys-text-secondary)' }}>Loading analytics...</div>
    );
  }

  const visionTotal =
    data.visionHealth.autoParsedPercentage +
    data.visionHealth.manualFallbackPercentage +
    data.visionHealth.failedPercentage;
  const autoDeg = (data.visionHealth.autoParsedPercentage / visionTotal) * 360;
  const manualDeg = (data.visionHealth.manualFallbackPercentage / visionTotal) * 360;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--sys-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Analytics Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sys-text-secondary)', maxWidth: 600 }}>
            Platform performance and insights for current billing cycle.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
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
              cursor: 'pointer',
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
          <div
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: '1px solid var(--sys-border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--sys-text-primary)',
            }}
          >
            Last 30 Days
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <StatCard
          title="Revenue (Current Cycle)"
          value={data.revenue.current}
          change={data.revenue.changePercentage}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
          onClick={() => navigate('/dashboard/pnl-deep-dive')}
        />
        <StatCard
          title="AI Server Costs"
          value={data.serverCosts.current}
          change={data.serverCosts.changePercentage}
          isCurrency
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--sys-status-error)"
              strokeWidth="2"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          }
        />
        <StatCard
          title="Net Margin"
          value={data.netMargin.current}
          change={data.netMargin.changePercentage}
          isPercent
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          }
        />
      </div>

      {/* ── Middle Row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Top Supermarket Chains */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
              Top Supermarket Chains
            </h2>
            <button
              onClick={() => navigate('/dashboard/supermarket-performance')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sys-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View All
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div
            style={{
              flex: 1,
              position: 'relative',
              minHeight: 180,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 24,
              padding: '0 20px',
              borderBottom: '1px solid var(--sys-border)',
            }}
          >
            {/* Background grid lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderTop: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0',
                top: '33%',
                height: '33%',
              }}
            />

            {data.topSupermarketChains.map((chain, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 40,
                    background: i === 0 ? 'var(--sys-primary)' : '#e4e4e7',
                    height: `${(chain.value / 100) * 140}px`,
                    borderRadius: '4px 4px 0 0',
                    opacity: i === 0 ? 1 : 0.6,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, padding: '12px 20px 0' }}>
            {data.topSupermarketChains.map((chain, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--sys-text-primary)',
                }}
              >
                {chain.name}
              </div>
            ))}
          </div>
        </div>

        {/* Vision AI Health */}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
              Vision AI Health
            </h2>
            <button
              onClick={() => navigate('/dashboard/vision-ai-logs')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sys-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View Logs
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--sys-text-secondary)', marginBottom: 32 }}>
            Receipt parsing accuracy & fallback rates.
          </p>

          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {/* Donut Chart via CSS */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `conic-gradient(var(--sys-primary) 0deg ${autoDeg}deg, #d97706 ${autoDeg}deg ${autoDeg + manualDeg}deg, var(--sys-status-error) ${autoDeg + manualDeg}deg 360deg)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyItems: 'center',
                padding: 12,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--sys-text-primary)' }}>
                  {Math.round(data.visionHealth.autoParsedPercentage)}%
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--sys-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Success
                </span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  label: 'Auto-Parsed',
                  val: data.visionHealth.autoParsedPercentage,
                  color: 'var(--sys-primary)',
                },
                {
                  label: 'Manual Fallback',
                  val: data.visionHealth.manualFallbackPercentage,
                  color: '#d97706',
                },
                {
                  label: 'Failed',
                  val: data.visionHealth.failedPercentage,
                  color: 'var(--sys-status-error)',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--sys-text-primary)',
                      }}
                    >
                      <span
                        style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }}
                      />
                      {item.label}
                    </span>
                    <span>{item.val.toFixed(1)}%</span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: '#f4f4f5',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.val}%`,
                        background: item.color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
        {/* User Distribution Map */}
        <div
          onClick={() => navigate('/dashboard/geographic-demographics')}
          style={{
            background: '#e9f1eb',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1,
              marginBottom: 4,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
              User Distribution
            </h2>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sys-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View Map
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--sys-text-secondary)', zIndex: 1 }}>
            Active households by region.
          </p>

          {/* Abstract map representation */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M20,80 Q40,40 60,70 T90,20 L100,100 L0,100 Z" fill="#d1e0d7" opacity="0.5" />
              <path d="M10,90 Q30,60 50,80 T80,30 L100,100 L0,100 Z" fill="#d1e0d7" opacity="0.3" />
            </svg>
          </div>
          {data.userDistribution.map((pt, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pt.lng}%`,
                top: `${pt.lat}%`,
                width: 12,
                height: 12,
                background: 'var(--sys-primary)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </div>

        {/* Top Grocery Categories */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--sys-text-primary)',
              marginBottom: 24,
            }}
          >
            Top Grocery Categories
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {data.topCategories.map((cat, i) => (
              <div key={i}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sys-text-primary)',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {i === 0 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                      </svg>
                    )}
                    {i === 1 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10" />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      </svg>
                    )}
                    {i === 3 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <circle cx="12" cy="14" r="4" />
                        <line x1="12" y1="6" x2="12.01" y2="6" />
                      </svg>
                    )}
                    {cat.name}
                  </span>
                  <span style={{ color: 'var(--sys-text-secondary)' }}>{cat.percentage}%</span>
                </div>
                <div
                  style={{ height: 6, background: '#f4f4f5', borderRadius: 3, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      background: 'var(--sys-primary)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
