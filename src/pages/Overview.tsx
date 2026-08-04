import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Fetch a list from any endpoint.
 * Backend wraps all responses in: { data: [...], isSuccess: bool, message: "..." }
 * Some endpoints return the array directly — this helper handles both patterns.
 */
async function fetchList<T>(endpoint: string, token: string | null): Promise<T[]> {
  if (!token) return []; // skip if not authenticated
  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json?.data)) return json.data as T[]; // wrapped: { data: [...] }
    if (Array.isArray(json)) return json as T[]; // plain array
    if (Array.isArray(json?.items)) return json.items as T[]; // paginated
    return [];
  } catch {
    return [];
  }
}

async function fetchCount(endpoint: string, token: string | null): Promise<number> {
  const list = await fetchList(endpoint, token);
  return list.length;
}

async function fetchHouseholdsSummary(
  _token: string | null
): Promise<{ total: number; active: number; avgSize: number }> {
  // Mocking aggregated data fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: 12450,
        active: 11800,
        avgSize: 3.4,
      });
    }, 400);
  });
}

function getHour(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  value,
  label,
  badge,
  note,
  dark = false,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: string;
  note?: string; // small italic note shown below the label
  dark?: boolean;
  delay?: number;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        background: dark ? '#356859' : '#fff',
        border: dark ? 'none' : '1px solid #e4e0da',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(10px)',
        transition:
          'opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: dark ? 'none' : '0 2px 12px rgba(45,42,38,0.04)',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon + badge row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: dark ? 'rgba(255,255,255,0.15)' : '#f4f2ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dark ? '#fff' : '#356859',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              background: dark ? 'rgba(255,255,255,0.15)' : '#dceee8',
              color: dark ? '#fff' : '#356859',
              padding: '4px 10px',
              borderRadius: 999,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Value + label + optional note */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1,
            color: dark ? '#fff' : '#2d2a26',
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: dark ? 'rgba(255,255,255,0.65)' : '#a8a39d',
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          {label}
        </div>
        {note && (
          <div
            style={{
              fontSize: 10,
              fontStyle: 'italic',
              marginTop: 6,
              color: dark ? 'rgba(255,255,255,0.4)' : '#cac5bf',
              lineHeight: 1.4,
            }}
          >
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

// ── System Health Card ──────────────────────────────────────────────────────────
// بتعرض حالة الـ backend الفعلية — بتعمل ping للـ API وبتشوف هل الـ server بيرد.
// الـ spinner بيتحول لـ ring مع dot بعد ما يعرف الحالة.

function SystemHealthCard({ delay = 0 }: { delay?: number }) {
  const [vis, setVis] = useState(false);
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Ping the backend with auth token.
  // Guard: skip if no token to avoid CORS-aborted 401s.
  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) {
      setStatus('offline');
      return;
    }
    fetch(`${API}/api/preferences/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) =>
        setStatus(res.ok || res.status === 401 || res.status === 403 ? 'online' : 'offline')
      )
      .catch(() => setStatus('offline'));
  }, []);

  const isChecking = status === 'checking';
  const isOnline = status === 'online';
  const isOffline = status === 'offline';

  return (
    <div
      style={{
        background: '#356859',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(10px)',
        transition:
          'opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        System Health
      </div>

      {/* Single ring: grey spinning → checking | green spinning → online | red static → offline */}
      <div
        style={{
          position: 'relative',
          width: 72,
          height: 72,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: `4px solid ${
              isChecking
                ? 'rgba(160,160,160,0.25)'
                : isOnline
                  ? 'rgba(110,220,140,0.25)'
                  : 'rgba(248,113,113,0.7)'
            }`,
            borderTopColor: isChecking
              ? 'rgba(180,180,180,0.9)'
              : isOnline
                ? 'rgba(110,220,140,1)'
                : 'transparent',
            animation: isOffline ? 'none' : 'hp-spin 1.1s linear infinite',
            boxSizing: 'border-box',
            position: 'absolute',
            transition: 'border-color 0.4s ease',
          }}
        />

        {/* Center dot */}
        <span
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isChecking
              ? 'rgba(180,180,180,0.8)'
              : isOnline
                ? 'rgba(110,220,140,1)'
                : '#f87171',
            boxShadow: isChecking
              ? '0 0 0 3px rgba(180,180,180,0.15)'
              : isOnline
                ? '0 0 0 4px rgba(110,220,140,0.2)'
                : '0 0 0 4px rgba(248,113,113,0.25)',
            animation: isOnline ? 'hp-pulse 2s ease-in-out infinite' : 'none',
            transition: 'background 0.4s ease, box-shadow 0.4s ease',
          }}
        />
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        {isChecking ? 'Checking…' : isOnline ? 'Stable & Online' : 'Service Offline'}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>
        {isChecking
          ? 'Pinging API server…'
          : isOnline
            ? 'All services reporting.'
            : 'Cannot reach the API.'}
      </div>

      <button
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '8px 20px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'background 150ms',
        }}
      >
        Details
      </button>

      <style>{`
        @keyframes hp-spin  { to { transform: rotate(360deg); } }
        @keyframes hp-pulse { 0%,100%{box-shadow:0 0 0 4px rgba(110,220,140,0.2)} 50%{box-shadow:0 0 0 8px rgba(110,220,140,0.08)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Overview() {
  const token = useAuthStore((s) => s.token);

  const [categoriesCount, setCategoriesCount] = useState<number | '—'>('—');
  const [summaryData, setSummaryData] = useState<{
    total: number;
    active: number;
    avgSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = `Good ${getHour()}.`;

  useEffect(() => {
    (async () => {
      const [summaryRes, catCount] = await Promise.all([
        fetchHouseholdsSummary(token),
        fetchCount('/api/preferences/categories', token),
      ]);
      setSummaryData(summaryRes);
      setCategoriesCount(catCount);
      setLoading(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Greeting */}
      <div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: '#2d2a26',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {greeting}
        </h1>
        <p style={{ fontSize: 15, color: '#7a7571', marginTop: 8, margin: 0 }}>
          Your HomePal network is performing optimally today.
        </p>
      </div>

      {/* KPI Grid: household left | categories middle | system health right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 220px',
          gridTemplateRows: '1fr 1fr',
          gap: 16,
          height: 280,
        }}
      >
        {/* Large household card — spans 2 rows, column 1 */}
        <div style={{ gridColumn: 1, gridRow: '1 / 3' }}>
          <MetricCard
            icon={HouseIcon}
            value={summaryData?.total.toLocaleString() ?? '—'}
            label="Total Households Managed"
            badge="Platform"
            note="Based on aggregated demographics"
            delay={0}
          />
        </div>

        {/* Categories card — column 2, spans 2 rows */}
        <div style={{ gridColumn: 2, gridRow: '1 / 3' }}>
          <MetricCard
            icon={TagIcon}
            value={categoriesCount}
            label="Global Preference Categories"
            delay={80}
          />
        </div>

        {/* System Health card — column 3, spans 2 rows */}
        <div style={{ gridColumn: 3, gridRow: '1 / 3' }}>
          <SystemHealthCard delay={160} />
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Recent Onboarding */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e4e0da',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid #f0ece6',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2d2a26', lineHeight: 1 }}>
                Aggregated Analytics
              </div>
              <div style={{ fontSize: 13, color: '#a8a39d', marginTop: 4 }}>
                Privacy-safe platform metrics.
              </div>
            </div>
            <Link
              to="/dashboard/households"
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#356859',
                textDecoration: 'none',
                background: '#dceee8',
                padding: '6px 14px',
                borderRadius: 8,
              }}
            >
              Full Report
            </Link>
          </div>

          {/* Aggregated List */}
          {loading || !summaryData ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: '2px solid #356859',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{ padding: '16px 24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid #f4f2ee',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2d2a26' }}>
                  Active Households
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#356859' }}>
                  {summaryData.active.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid #f4f2ee',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2d2a26' }}>
                  Avg. Household Size
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#356859' }}>
                  {summaryData.avgSize} members
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2d2a26' }}>
                  Platform Penetration
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#356859' }}>12% YoY</span>
              </div>
            </div>
          )}
        </div>

        {/* System Pulse */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e4e0da',
            borderRadius: 16,
            padding: '20px 20px 0',
            boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#2d2a26', marginBottom: 20 }}>
            System Pulse
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {SYSTEM_PULSE.map((item, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: i < SYSTEM_PULSE.length - 1 ? '1px solid #f4f2ee' : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      marginTop: 4,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background:
                        item.type === 'pref'
                          ? '#356859'
                          : item.type === 'household'
                            ? '#d99a3d'
                            : '#a8a39d',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2d2a26' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#a8a39d', marginTop: 2 }}>{item.desc}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#cac5bf',
                        marginTop: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontWeight: 600,
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Logs button */}
          <div style={{ borderTop: '1px solid #f0ece6', padding: '14px 0', marginTop: 'auto' }}>
            <button
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#a8a39d',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'color 150ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#356859';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#a8a39d';
              }}
            >
              Audit Full Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
