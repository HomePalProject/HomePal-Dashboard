import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string;
  flyerUrl: string;
  supermarket: string;
  date: string;
  errorCode: 'LOW_CONFIDENCE_OCR' | 'JSON_SCHEMA_MISMATCH' | 'MISSING_PRICE_TAGS';
  status: 'ACTION_REQUIRED' | 'IN_REVIEW' | 'RESOLVED';
}

interface ErrorInsights {
  lowConfidenceOcr: number;
  schemaMismatch: number;
  missingDataFields: number;
}

interface VisionLogsData {
  logs: LogEntry[];
  insights: ErrorInsights;
  resolvedThisWeek: number;
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

const badgeStyles = {
  LOW_CONFIDENCE_OCR: { color: '#b91c1c', bg: '#fee2e2' },
  JSON_SCHEMA_MISMATCH: { color: '#c2410c', bg: '#ffedd5' },
  MISSING_PRICE_TAGS: { color: '#4b5563', bg: '#f3f4f6' },
};

const statusStyles = {
  ACTION_REQUIRED: { color: '#b91c1c', label: 'ACTION REQUIRED' },
  IN_REVIEW: { color: '#c2410c', label: 'IN REVIEW' },
  RESOLVED: { color: '#15803d', label: 'RESOLVED' },
};

export default function VisionAILogs() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<VisionLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [filterError, setFilterError] = useState('ALL');
  const [filterActionRequired, setFilterActionRequired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Modal State
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [modalJsonText, setModalJsonText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<VisionLogsData>('/api/analytics/vision-logs', token);

    if (res.data) {
      setData(res.data);
    } else {
      // MOCK DATA FALLBACK
      setData({
        logs: [
          {
            id: '1',
            flyerUrl:
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Whole Foods Market',
            date: 'Oct 24, 09:12 AM',
            errorCode: 'LOW_CONFIDENCE_OCR',
            status: 'ACTION_REQUIRED',
          },
          {
            id: '2',
            flyerUrl:
              'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=150',
            supermarket: "Trader Joe's",
            date: 'Oct 23, 14:45 PM',
            errorCode: 'JSON_SCHEMA_MISMATCH',
            status: 'IN_REVIEW',
          },
          {
            id: '3',
            flyerUrl:
              'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Safeway',
            date: 'Oct 22, 11:20 AM',
            errorCode: 'MISSING_PRICE_TAGS',
            status: 'RESOLVED',
          },
          {
            id: '4',
            flyerUrl:
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Kroger',
            date: 'Oct 21, 08:30 AM',
            errorCode: 'LOW_CONFIDENCE_OCR',
            status: 'ACTION_REQUIRED',
          },
          {
            id: '5',
            flyerUrl:
              'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Target',
            date: 'Oct 20, 16:15 PM',
            errorCode: 'JSON_SCHEMA_MISMATCH',
            status: 'ACTION_REQUIRED',
          },
          {
            id: '6',
            flyerUrl:
              'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Walmart',
            date: 'Oct 19, 10:00 AM',
            errorCode: 'MISSING_PRICE_TAGS',
            status: 'IN_REVIEW',
          },
          {
            id: '7',
            flyerUrl:
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150',
            supermarket: 'Whole Foods Market',
            date: 'Oct 18, 09:45 AM',
            errorCode: 'LOW_CONFIDENCE_OCR',
            status: 'RESOLVED',
          },
        ],
        insights: {
          lowConfidenceOcr: 45,
          schemaMismatch: 30,
          missingDataFields: 15,
        },
        resolvedThisWeek: 24,
      });
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate API call for sync
    await new Promise((r) => setTimeout(r, 1500));
    setIsSyncing(false);
    showToast('Data synced successfully');
    setCurrentPage(1);
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    // Simulate API call to initiate model retraining
    await new Promise((r) => setTimeout(r, 2000));
    setIsRetraining(false);
    showToast('AI Model retraining initiated successfully');
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['ID', 'Supermarket', 'Date', 'Error Code', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.logs.map((log) =>
        [log.id, `"${log.supermarket}"`, `"${log.date}"`, log.errorCode, log.status].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vision_ai_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exported successfully');
  };

  const handleRowAction = (log: LogEntry) => {
    setSelectedLog(log);
    // Provide a dummy JSON schema structure for editing
    setModalJsonText(
      JSON.stringify(
        {
          supermarket: log.supermarket,
          date: log.date.split(',')[0],
          totalAmount: 0.0,
          items: [
            { name: 'Unknown Item 1', price: 0.0 },
            { name: 'Unknown Item 2', price: 0.0 },
          ],
        },
        null,
        2
      )
    );
  };

  const handleSaveOverride = () => {
    if (!selectedLog || !data) return;

    // Update local data to reflect resolution
    const updatedLogs = data.logs.map((l) =>
      l.id === selectedLog.id ? { ...l, status: 'RESOLVED' as const } : l
    );

    setData({
      ...data,
      logs: updatedLogs,
      resolvedThisWeek: data.resolvedThisWeek + 1,
    });

    setSelectedLog(null);
    showToast(`Override saved for ${selectedLog.supermarket}. Status updated to RESOLVED.`);
  };

  if (loading || !data) {
    return <div style={{ padding: 40, color: 'var(--sys-text-secondary)' }}>Loading logs...</div>;
  }

  // Derived Data: Filtering
  const filteredLogs = data.logs.filter((log) => {
    if (filterError !== 'ALL' && log.errorCode !== filterError) return false;
    if (filterActionRequired && log.status !== 'ACTION_REQUIRED') return false;
    return true;
  });

  // Derived Data: Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <span>Settings</span>
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
            <span style={{ color: 'var(--sys-text-primary)' }}>Vision AI Ingestion</span>
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
            Ingestion Logs & Fallback
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sys-text-secondary)', maxWidth: 600 }}>
            Monitor flyer parsing performance, review low-confidence OCR results, and manually
            override schema mismatches to train the Vision AI models.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button
            onClick={handleExportCSV}
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
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
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
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              position: 'relative',
              opacity: isSyncing ? 0.8 : 1,
            }}
          >
            <svg
              style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}
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
            Sync Now
            {isSyncing && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  background: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                }}
              />
            )}
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
              Failed & Manual-Fallback Queue
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select
                value={filterError}
                onChange={(e) => {
                  setFilterError(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--sys-border)',
                  fontSize: 13,
                  color: 'var(--sys-text-secondary)',
                  background: '#fafafa',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Errors</option>
                <option value="LOW_CONFIDENCE_OCR">Low Confidence</option>
                <option value="JSON_SCHEMA_MISMATCH">Schema Mismatch</option>
                <option value="MISSING_PRICE_TAGS">Missing Tags</option>
              </select>
              <button
                onClick={() => {
                  setFilterActionRequired(!filterActionRequired);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  background: filterActionRequired ? '#b91c1c' : '#fef2f2',
                  color: filterActionRequired ? '#fff' : '#b91c1c',
                  border: filterActionRequired ? '1px solid #b91c1c' : '1px solid #fecaca',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Action Required
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sys-border)' }}>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Flyer
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Supermarket
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Error Code
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '16px 24px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sys-text-secondary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '40px 24px',
                      textAlign: 'center',
                      color: 'var(--sys-text-secondary)',
                    }}
                  >
                    No errors found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const badge = badgeStyles[log.errorCode];
                  const status = statusStyles[log.status];

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--sys-border)',
                        transition: 'background 0.2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div
                          style={{
                            width: 48,
                            height: 64,
                            borderRadius: 6,
                            border: '1px solid var(--sys-border)',
                            overflow: 'hidden',
                            background: '#f4f4f5',
                          }}
                        >
                          <img
                            src={log.flyerUrl}
                            alt="Flyer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--sys-text-primary)',
                        }}
                      >
                        {log.supermarket}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          fontSize: 13,
                          color: 'var(--sys-text-secondary)',
                        }}
                      >
                        {log.date.split(',').map((part, i) => (
                          <div key={i}>{part.trim()}</div>
                        ))}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '4px 10px',
                            background: badge.bg,
                            color: badge.color,
                            borderRadius: 16,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {log.errorCode}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            color: status.color,
                            letterSpacing: '0.02em',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: status.color,
                              animation:
                                log.status === 'ACTION_REQUIRED' ? 'pulse 2s infinite' : 'none',
                            }}
                          />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          onClick={() => handleRowAction(log)}
                          style={{
                            padding: '6px 12px',
                            background: '#fff',
                            border: `1px solid ${log.status === 'ACTION_REQUIRED' ? 'var(--sys-primary)' : 'var(--sys-border)'}`,
                            color:
                              log.status === 'ACTION_REQUIRED'
                                ? 'var(--sys-primary)'
                                : 'var(--sys-text-secondary)',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                        >
                          {log.status === 'ACTION_REQUIRED'
                            ? 'Review & Override'
                            : log.status === 'IN_REVIEW'
                              ? 'Continue Review'
                              : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'var(--sys-text-secondary)',
              fontSize: 13,
            }}
          >
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)}-
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}{' '}
              errors
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1px solid var(--sys-border)',
                  borderRadius: 6,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: 'var(--sys-text-primary)',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  border: '1px solid var(--sys-border)',
                  borderRadius: 6,
                  cursor:
                    currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                  color: 'var(--sys-text-primary)',
                  opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
                }}
              >
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Side Panels ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Error Insights */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--sys-border)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sys-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                Error Insights
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
              Breakdown of parsing failures over the last 7 days.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  label: 'Low Confidence OCR',
                  val: data.insights.lowConfidenceOcr,
                  color: '#dc2626',
                },
                { label: 'Schema Mismatch', val: data.insights.schemaMismatch, color: '#ea580c' },
                {
                  label: 'Missing Data Fields',
                  val: data.insights.missingDataFields,
                  color: '#10b981',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: 'var(--sys-text-primary)',
                    }}
                  >
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
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
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Retraining */}
          <div
            style={{
              background: 'var(--sys-primary)',
              borderRadius: 12,
              padding: '24px',
              color: '#fff',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Model Retraining</h2>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              You have manually resolved {data.resolvedThisWeek} schema mismatches this week. The
              Vision AI model is ready for incremental fine-tuning.
            </p>
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                color: 'var(--sys-primary)',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: isRetraining ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                opacity: isRetraining ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRetraining) e.currentTarget.style.background = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                if (!isRetraining) e.currentTarget.style.background = '#fff';
              }}
            >
              {isRetraining ? (
                <>
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
                  Retraining...
                </>
              ) : (
                <>
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
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Initiate Retraining
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {selectedLog && (
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
            onClick={() => setSelectedLog(null)}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 16,
              width: '90%',
              maxWidth: 900,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--sys-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
                  {selectedLog.status === 'RESOLVED'
                    ? 'View Extraction Details'
                    : 'Review & Override Extracted Data'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--sys-text-secondary)' }}>
                    {selectedLog.supermarket} • {selectedLog.date}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '2px 8px',
                      background: badgeStyles[selectedLog.errorCode].bg,
                      color: badgeStyles[selectedLog.errorCode].color,
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {selectedLog.errorCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--sys-text-secondary)',
                  padding: 4,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content (Split View) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                flex: 1,
                overflow: 'hidden',
              }}
            >
              {/* Left: Original Flyer */}
              <div
                style={{
                  background: '#f4f4f5',
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={selectedLog.flyerUrl}
                  alt="Flyer"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>

              {/* Right: JSON Editor */}
              <div
                style={{ padding: 24, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
              >
                <div
                  style={{
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                    Extracted JSON Output
                  </span>
                  {selectedLog.status !== 'RESOLVED' && (
                    <span style={{ fontSize: 12, color: 'var(--sys-text-secondary)' }}>
                      Edit fields to correct{' '}
                      {selectedLog.errorCode.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <textarea
                  value={modalJsonText}
                  onChange={(e) => setModalJsonText(e.target.value)}
                  readOnly={selectedLog.status === 'RESOLVED'}
                  style={{
                    flex: 1,
                    width: '100%',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid var(--sys-border)',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--sys-text-primary)',
                    background: selectedLog.status === 'RESOLVED' ? '#fafafa' : '#fff',
                    resize: 'none',
                    outline: 'none',
                  }}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--sys-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                background: '#fafafa',
              }}
            >
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  border: '1px solid var(--sys-border)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--sys-text-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                {selectedLog.status === 'RESOLVED' ? 'Close' : 'Cancel'}
              </button>
              {selectedLog.status !== 'RESOLVED' && (
                <button
                  onClick={handleSaveOverride}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--sys-primary)',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'opacity 0.2s',
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Override
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global styles and Toast */}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
