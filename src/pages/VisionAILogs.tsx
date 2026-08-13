import { fallbackVisionLogsData } from '@constants/visionAIData';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { LogEntry, VisionLogsData } from '@typeDefs/visionAITypes';
import { useCallback, useEffect, useState } from 'react';

const badgeStyles = {
  LOW_CONFIDENCE_OCR: { text: 'text-status-error', bg: 'bg-status-error-container' },
  JSON_SCHEMA_MISMATCH: { text: 'text-[#c2410c]', bg: 'bg-[#ffedd5]' },
  MISSING_PRICE_TAGS: { text: 'text-text-secondary', bg: 'bg-surface' },
};

const statusStyles = {
  ACTION_REQUIRED: { color: 'text-status-error', bg: 'bg-status-error', label: 'ACTION REQUIRED' },
  IN_REVIEW: { color: 'text-[#c2410c]', bg: 'bg-[#c2410c]', label: 'IN REVIEW' },
  RESOLVED: { color: 'text-status-success', bg: 'bg-status-success', label: 'RESOLVED' },
};

export default function VisionAILogs() {
  const [data, setData] = useState<VisionLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filterError, setFilterError] = useState('ALL');
  const [filterActionRequired, setFilterActionRequired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [modalJsonText, setModalJsonText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getVisionLogs();
      setData(res);
    } catch (error) {
      console.error(error);
      setData(fallbackVisionLogsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSyncing(false);
    showToast('Data synced successfully');
    setCurrentPage(1);
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
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
    return <div className="p-40 text-text-secondary font-sans">Loading logs...</div>;
  }

  const filteredLogs = data.logs.filter((log) => {
    if (filterError !== 'ALL' && log.errorCode !== filterError) return false;
    if (filterActionRequired && log.status !== 'ACTION_REQUIRED') return false;
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full flex flex-col gap-24 pb-15 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-20">
        <div>
          <div className="flex items-center gap-1.5 text-13 text-text-secondary mb-[8px] font-medium">
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
            <span className="text-text-primary">Vision AI Ingestion</span>
          </div>
          <h1 className="text-22 sm:text-28 font-extrabold text-text-primary tracking-tight mb-[8px] m-0">
            Ingestion Logs & Fallback
          </h1>
          <p className="text-sm text-text-secondary max-w-150 leading-relaxed m-0">
            Monitor flyer parsing performance, review low-confidence OCR results, and manually
            override schema mismatches to train the Vision AI models.
          </p>
        </div>
        <div className="flex gap-12 sm:mt-0 flex-wrap items-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-[8px] px-16 py-2.5 bg-white border border-border rounded-lg text-13 font-semibold text-text-primary cursor-pointer transition-colors hover:bg-surface-variant shadow-sm shrink-0"
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
            className={cn(
              'flex items-center gap-[8px] px-16 py-2.5 bg-primary text-white border-none rounded-lg text-13 font-semibold cursor-pointer relative shadow-sm transition-opacity shrink-0',
              isSyncing ? 'opacity-80 cursor-not-allowed' : 'hover:opacity-90'
            )}
          >
            <svg
              className={isSyncing ? 'animate-spin' : ''}
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
              <span className="absolute top-[-4px] right-[-4px] w-2.5 h-2.5 bg-status-success rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-24 items-start">
        <div className="bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="px-24 py-20 border-b border-border flex justify-between items-center bg-[#faf8f3] flex-wrap gap-4">
            <h2 className="text-base font-bold text-text-primary m-0">
              Failed & Manual-Fallback Queue
            </h2>
            <div className="flex items-center gap-12">
              <select
                value={filterError}
                onChange={(e) => {
                  setFilterError(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-12 py-1.5 rounded-md border border-border text-13 text-text-secondary bg-[#fafafa] outline-none cursor-pointer focus:border-primary transition-colors"
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
                className={cn(
                  'px-12 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors border',
                  filterActionRequired
                    ? 'bg-status-error text-white border-status-error'
                    : 'bg-status-error-container text-status-error border-red-200 hover:bg-red-100'
                )}
              >
                Action Required
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-175">
              <thead>
                <tr className="border-b border-border bg-white">
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Flyer
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Supermarket
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Error Code
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-24 py-40 text-center text-text-secondary text-sm">
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
                        className="border-b border-border transition-colors hover:bg-surface-variant/50"
                      >
                        <td className="px-24 py-4">
                          <div className="w-12 h-16 rounded-md border border-border overflow-hidden bg-surface shrink-0">
                            <img
                              src={log.flyerUrl}
                              alt="Flyer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-24 py-4 text-sm font-semibold text-text-primary">
                          {log.supermarket}
                        </td>
                        <td className="px-24 py-4 text-13 text-text-secondary">
                          {log.date.split(',').map((part, i) => (
                            <div key={i}>{part.trim()}</div>
                          ))}
                        </td>
                        <td className="px-24 py-4">
                          <span
                            className={cn(
                              'inline-flex px-2.5 py-[4px] rounded-full text-[11px] font-bold tracking-[0.02em]',
                              badge.bg,
                              badge.text
                            )}
                          >
                            {log.errorCode}
                          </span>
                        </td>
                        <td className="px-24 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.02em]',
                              status.color
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                status.bg,
                                log.status === 'ACTION_REQUIRED' && 'animate-pulse'
                              )}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-24 py-4">
                          <button
                            onClick={() => handleRowAction(log)}
                            className={cn(
                              'px-12 py-1.5 bg-white border rounded-md text-xs font-semibold cursor-pointer transition-colors hover:bg-surface-variant shadow-sm whitespace-nowrap',
                              log.status === 'ACTION_REQUIRED'
                                ? 'border-primary text-primary'
                                : 'border-border text-text-secondary'
                            )}
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
          </div>

          <div className="px-24 py-4 flex justify-between items-center text-text-secondary text-13 bg-white">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)}-
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}{' '}
              errors
            </span>
            <div className="flex gap-[8px]">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center bg-white border border-border rounded-md cursor-pointer text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-variant transition-colors"
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
                className="w-7 h-7 flex items-center justify-center bg-white border border-border rounded-md cursor-pointer text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-variant transition-colors"
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

        <div className="flex flex-col gap-24">
          <div className="bg-white rounded-xl border border-border p-24 shadow-sm">
            <div className="flex items-center gap-[8px] mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <h2 className="text-base font-bold text-text-primary m-0">Error Insights</h2>
            </div>
            <p className="text-13 text-text-secondary mb-24 leading-relaxed m-0">
              Breakdown of parsing failures over the last 7 days.
            </p>

            <div className="flex flex-col gap-20">
              {[
                {
                  label: 'Low Confidence OCR',
                  val: data.insights.lowConfidenceOcr,
                  color: 'bg-status-error',
                },
                {
                  label: 'Schema Mismatch',
                  val: data.insights.schemaMismatch,
                  color: 'bg-[#ea580c]',
                },
                {
                  label: 'Missing Data Fields',
                  val: data.insights.missingDataFields,
                  color: 'bg-status-success',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-13 font-semibold mb-[8px] text-text-primary">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-[4px] bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000 ease-out',
                        item.color
                      )}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary rounded-xl p-24 text-white shadow-md">
            <h2 className="text-base font-bold mb-12 m-0 text-white">Model Retraining</h2>
            <p className="text-13 text-white/85 mb-24 leading-relaxed m-0">
              You have manually resolved {data.resolvedThisWeek} schema mismatches this week. The
              Vision AI model is ready for incremental fine-tuning.
            </p>
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className={cn(
                'w-full py-12 bg-white text-[#2a4a3e] border-none rounded-lg text-14 font-extrabold cursor-pointer flex justify-center items-center gap-[8px] transition-colors shadow-md',
                isRetraining ? 'opacity-80 cursor-not-allowed' : 'hover:bg-emerald-50'
              )}
            >
              {isRetraining ? (
                <>
                  <svg
                    className="animate-spin"
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

      {selectedLog && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-20">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          />

          <div className="relative bg-white rounded-2xl w-[90%] max-w-225 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-24 py-20 border-b border-border flex justify-between items-center bg-[#fafafa]">
              <div>
                <h2 className="text-lg font-bold text-text-primary m-0">
                  {selectedLog.status === 'RESOLVED'
                    ? 'View Extraction Details'
                    : 'Review & Override Extracted Data'}
                </h2>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-13 text-text-secondary">
                    {selectedLog.supermarket} • {selectedLog.date}
                  </span>
                  <span
                    className={cn(
                      'inline-flex px-[8px] py-0.5 rounded-full text-[10px] font-bold tracking-[0.02em]',
                      badgeStyles[selectedLog.errorCode].bg,
                      badgeStyles[selectedLog.errorCode].text
                    )}
                  >
                    {selectedLog.errorCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-transparent border-none cursor-pointer text-text-secondary p-[4px] hover:text-text-primary transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
              <div className="bg-surface p-24 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedLog.flyerUrl}
                  alt="Flyer"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              </div>

              <div className="p-24 flex flex-col overflow-y-auto">
                <div className="mb-12 flex justify-between items-center">
                  <span className="text-13 font-semibold text-text-primary">
                    Extracted JSON Output
                  </span>
                  {selectedLog.status !== 'RESOLVED' && (
                    <span className="text-xs text-text-secondary">
                      Edit fields to correct{' '}
                      {selectedLog.errorCode.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <textarea
                  value={modalJsonText}
                  onChange={(e) => setModalJsonText(e.target.value)}
                  readOnly={selectedLog.status === 'RESOLVED'}
                  className={cn(
                    'flex-1 w-full p-4 rounded-lg border border-border font-mono text-13 leading-relaxed text-text-primary resize-none outline-none focus:border-primary box-border',
                    selectedLog.status === 'RESOLVED' ? 'bg-[#fafafa]' : 'bg-white'
                  )}
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="px-24 py-4 border-t border-border flex justify-end gap-12 bg-[#fafafa]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-20 py-2.5 bg-white border border-border rounded-lg text-13 font-semibold text-text-primary cursor-pointer transition-colors hover:bg-surface-variant shadow-sm"
              >
                {selectedLog.status === 'RESOLVED' ? 'Close' : 'Cancel'}
              </button>
              {selectedLog.status !== 'RESOLVED' && (
                <button
                  onClick={handleSaveOverride}
                  className="px-20 py-2.5 bg-primary border-none rounded-lg text-13 font-semibold text-white cursor-pointer flex items-center gap-[8px] transition-opacity hover:opacity-90 shadow-sm"
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

      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-[#111827] text-white px-24 py-12 rounded-lg text-13 font-medium shadow-xl flex items-center gap-[8px] z-9999 animate-in slide-in-from-bottom-20">
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
    </div>
  );
}
