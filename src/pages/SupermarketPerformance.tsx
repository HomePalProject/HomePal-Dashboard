import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@lib/utils';
import { analyticsService } from '@services/analyticsService';
import type { SupermarketPerformanceData } from '@typeDefs/supermarketTypes';
import { mockSupermarketPerformanceData } from '@constants/supermarketData';

export default function SupermarketPerformance() {
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
    try {
      const res = await analyticsService.getSupermarketPerformance();
      setData(res);
    } catch {
      setData(mockSupermarketPerformanceData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
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
    return <div className="p-40 text-text-secondary font-sans">Loading analytics...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-24 pb-15 font-sans relative">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-16">
        <div>
          <div className="flex items-center gap-1.5 text-13 text-text-secondary mb-[8px] font-medium">
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
            <span className="text-text-primary">Analytics</span>
          </div>
          <h1 className="text-22 sm:text-28 font-extrabold text-text-primary tracking-tight mb-[8px] m-0">
            Supermarket Performance
          </h1>
          <p className="text-sm text-text-secondary max-w-150 m-0">
            Analyze B2B partner engagement, monitor data ingestion, and identify strategic growth
            opportunities.
          </p>
        </div>
        <div className="flex gap-12 sm:mt-0 flex-wrap items-center">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-[8px] px-16 py-2.5 bg-white border border-border rounded-lg text-13 font-semibold text-text-primary transition-all duration-200 shrink-0 shadow-sm',
              isExporting
                ? 'opacity-70 cursor-not-allowed'
                : 'cursor-pointer hover:bg-surface-variant'
            )}
          >
            {isExporting ? (
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
            className="flex items-center gap-[8px] px-16 py-2.5 bg-primary text-white border-none rounded-lg text-13 font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-90 shrink-0 shadow-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-24 items-start">
        {/* ── Main Table ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="px-24 py-20 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-[8px]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h2 className="text-base font-bold text-text-primary m-0">
                Partner Performance Index
              </h2>
            </div>
            <button className="bg-transparent border-none text-text-secondary text-13 font-semibold cursor-pointer flex items-center gap-[4px] hover:text-primary transition-colors">
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
                <tr className="border-b border-border">
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase">
                    Rank
                  </th>
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase">
                    Partner Chain
                  </th>
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase">
                    Active Offers
                  </th>
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase">
                    User CTR
                  </th>
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase">
                    Ingestion Rate
                  </th>
                  <th className="px-24 py-4 text-[11px] font-semibold text-text-secondary uppercase text-right">
                    Predicted Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b border-border transition-colors duration-200 hover:bg-surface-variant/50 cursor-pointer"
                  >
                    <td className="px-24 py-4 text-sm font-semibold text-text-primary">
                      {partner.rank}
                    </td>
                    <td className="px-24 py-4 flex items-center gap-12">
                      <div className="w-32 h-32 rounded-full border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary bg-white">
                        {partner.code}
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {partner.chain}
                      </span>
                    </td>
                    <td className="px-24 py-4 text-13 text-text-secondary">
                      {partner.activeOffers}
                    </td>
                    <td className="px-24 py-4 text-13 text-text-secondary">{partner.userCtr}</td>
                    <td className="px-24 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full text-[11px] font-bold"
                        style={{
                          background: partner.ingestionRate.bg,
                          color: partner.ingestionRate.color,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: partner.ingestionRate.color }}
                        />
                        {partner.ingestionRate.value}
                      </span>
                    </td>
                    <td className="px-24 py-4 text-13 font-semibold text-text-primary text-right">
                      <div className="flex items-center justify-end gap-[4px]">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Side Panels ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-24">
          {/* Partnership Opportunities */}
          <div className="bg-[#fcf6f3] rounded-xl border border-[#f9d8c4] p-24">
            <div className="flex items-center gap-[8px] mb-4">
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
              <h2 className="text-base font-bold text-text-primary m-0">
                Partnership Opportunities
              </h2>
            </div>
            <p className="text-13 text-text-secondary mb-24 leading-relaxed m-0">
              Stores exhibiting high user search volume but suffering from low active data coverage.
            </p>

            <div className="flex flex-col gap-4">
              {/* Waitrose */}
              <div className="bg-white rounded-lg p-4 border border-border flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-[4px] m-0">Waitrose</h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
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
                <div className="text-right">
                  <div className="text-13 font-bold text-text-primary">
                    {data.opportunities.waitrose.potential}
                  </div>
                  <div className="text-[11px] text-text-secondary">Potential</div>
                </div>
              </div>

              {/* Choithrams */}
              <div className="bg-white rounded-lg p-4 border border-border flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-[4px] m-0">
                    Choithrams
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
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
                <div className="text-right">
                  <div className="text-13 font-bold text-[#d97706]">
                    {data.opportunities.choithrams.potential}
                  </div>
                  <div className="text-[11px] text-text-secondary">Potential</div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Conversion Funnel */}
          <div className="bg-white rounded-xl border border-border p-24">
            <h2 className="text-base font-bold text-text-primary text-center mb-24 m-0">
              Global Conversion Funnel
            </h2>

            <div className="flex flex-col gap-[8px] items-center">
              {/* Funnel Step 1 */}
              <div className="w-full bg-[#e2e8f0] px-20 py-12 rounded flex justify-between items-center">
                <div className="flex items-center gap-[8px] text-13 font-semibold text-text-primary">
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
                <span className="text-13 font-semibold text-text-secondary">
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
              <div className="w-[85%] bg-[#f1f5f9] px-20 py-12 rounded flex justify-between items-center">
                <div className="flex items-center gap-[8px] text-13 font-semibold text-text-primary">
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
                <span className="text-13 font-semibold text-text-secondary">
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
              <div className="w-[70%] bg-[#d1e6e0] px-20 py-12 rounded flex justify-between items-center">
                <div className="flex items-center gap-[8px] text-13 font-semibold text-text-primary">
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
                <span className="text-13 font-bold text-text-primary">
                  {data.funnel.purchaseLogged}
                </span>
              </div>
            </div>

            <div className="text-center mt-24 text-13 text-text-secondary">
              Overall Conversion Rate:{' '}
              <span className="font-bold text-text-primary">{data.funnel.conversionRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals & Toasts ───────────────────────────────────────────── */}

      {/* New Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-20">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-125 p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-text-primary mb-[8px] m-0">Add New Partner</h2>
            <p className="text-13 text-text-secondary mb-24 m-0">
              Enter the supermarket details to initialize integration.
            </p>

            <form onSubmit={handleAddPartner} className="flex flex-col gap-4">
              <div>
                <label className="block text-13 font-semibold text-text-primary mb-1.5">
                  Supermarket Chain Name
                </label>
                <input
                  required
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border outline-none focus:border-primary text-sm box-border"
                  placeholder="e.g. Al Maya"
                />
              </div>
              <div>
                <label className="block text-13 font-semibold text-text-primary mb-1.5">
                  Website URL
                </label>
                <input
                  required
                  type="url"
                  value={newPartner.website}
                  onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border outline-none focus:border-primary text-sm box-border"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-13 font-semibold text-text-primary mb-1.5">
                  Contact Email
                </label>
                <input
                  required
                  type="email"
                  value={newPartner.contactEmail}
                  onChange={(e) => setNewPartner({ ...newPartner, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border outline-none focus:border-primary text-sm box-border"
                  placeholder="integration@supermarket.com"
                />
              </div>

              <div className="flex justify-end gap-12 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-20 py-2.5 bg-white border border-border rounded-lg text-13 font-semibold cursor-pointer hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'px-20 py-2.5 bg-primary text-white border-none rounded-lg text-13 font-semibold flex items-center gap-[8px] transition-opacity',
                    isSubmitting
                      ? 'cursor-not-allowed opacity-75'
                      : 'cursor-pointer hover:opacity-90'
                  )}
                >
                  {isSubmitting && (
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
                  )}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-[#111827] text-white px-24 py-12 rounded-lg text-13 font-medium shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center gap-[8px] z-9999 animate-in slide-in-from-bottom-20 fade-in duration-300">
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
