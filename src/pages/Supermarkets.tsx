import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn, getErrorMessage } from '@lib/utils';
import { catalogService } from '@services/catalogService';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { getLocalString, getImageUrl } from '@lib/formatters';
import { fetchBilingual } from '@lib/localization';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { SupermarketFormModal } from '@components/supermarkets/SupermarketFormModal';

const BRANCH_COUNTS: Record<string, number> = {
  'Carrefour Egypt': 69,
  'Spinneys Egypt': 35,
  'Metro Market': 48,
  Kazyon: 450,
  'Seoudi Market': 21,
  'Lulu Hypermarket': 4,
  'BIM Egypt': 300,
  'Abdullah AlOthaim': 61,
  'Awlad Ragab': 75,
  'Gomla Market': 12,
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function SupermarketLogo({
  logoPath,
  name,
  className = 'w-12 h-12 sm:w-14 sm:h-14',
}: {
  logoPath?: string | null;
  name: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const fullUrl = getImageUrl(logoPath);

  if (fullUrl && !imgError) {
    return (
      <div
        className={cn(
          'rounded-full overflow-hidden bg-white border-2 border-[#EAE5D9] shrink-0 shadow-xs flex items-center justify-center p-0',
          className
        )}
      >
        <img
          src={fullUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-white border-2 border-[#EAE5D9] text-[#1A2E26] font-black text-xl flex items-center justify-center shrink-0 shadow-xs',
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export default function Supermarkets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [marketModal, setMarketModal] = useState<{ open: boolean; editing?: Supermarket }>({
    open: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setMarketModal({ open: true });
      // Clean query parameter after opening
      setSearchParams(
        (prev) => {
          prev.delete('openAdd');
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogService.getSupermarkets();
      setSupermarkets(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setSupermarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filtered = supermarkets.filter((s) =>
    getLocalString(s.name).toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveMarket = async (data: any) => {
    try {
      const res: any = await catalogService.saveSupermarket(data, marketModal.editing?.id);
      const targetId = marketModal.editing?.id || res?.data?.data?.id || res?.data?.id || res?.id;

      if (targetId && data.logoFile) {
        await catalogService.uploadSupermarketLogo(targetId, data.logoFile);
      } else if (targetId && data.deleteLogo) {
        await catalogService.deleteSupermarketLogo(targetId).catch(() => null);
      }

      void fetchData();
      return null;
    } catch (error: any) {
      return getErrorMessage(error);
    }
  };

  const handleEditSupermarket = async (s: Supermarket) => {
    setLoadingEditId(s.id);
    try {
      const { en, ar } = await fetchBilingual((lang) =>
        catalogService.getSupermarketById(s.id, lang)
      );
      setMarketModal({
        open: true,
        editing: {
          ...s,
          name: [
            { culture: 'en', value: getLocalString(en.name) },
            { culture: 'ar', value: getLocalString(ar.name) },
          ],
        },
      });
    } catch {
      setMarketModal({ open: true, editing: s });
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await catalogService.deleteSupermarket(deleteTarget.id);
      setDeleteTarget(null);
      void fetchData();
    } catch (error: any) {
      alert(`Delete failed: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-4 sm:px-0">
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-[#4A6B5D] tracking-wide mb-1">
            Catalog Operations / <span className="font-bold text-[#1A2E26]">Supermarkets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E26] tracking-tight m-0">
            Supermarket Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Manage corporate retail chains and catalog ingestion endpoints.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-xs font-bold text-[#2C4A3E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>

          <button
            onClick={() => setMarketModal({ open: true })}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F3D32] hover:bg-[#152a22] text-white border-none rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Supermarket</span>
          </button>
        </div>
      </div>

      {/* ── Control Bar Card ── */}
      <div className="bg-white border border-[#EAE5D9] rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search chains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#EAE5D9] text-xs outline-none focus:border-[#1B4332] bg-[#FAF8F5] transition-colors"
            />
          </div>

          {/* Chain Count Badge */}
          <span className="px-3 py-1.5 bg-[#F4EFE6] border border-[#E5DFD3] rounded-full text-xs font-bold text-[#1A2E26] shrink-0">
            {supermarkets.length} Chains
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-[#FAF8F5] border border-[#EAE5D9] rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none transition-colors',
              viewMode === 'grid'
                ? 'bg-white text-[#1A2E26] shadow-xs'
                : 'text-slate-500 hover:text-[#1A2E26] bg-transparent'
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none transition-colors',
              viewMode === 'table'
                ? 'bg-white text-[#1A2E26] shadow-xs'
                : 'text-slate-500 hover:text-[#1A2E26] bg-transparent'
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Table
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#EAE5D9] p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {filtered.map((s) => {
            const name = getLocalString(s.name);
            const branches = s.branches ?? BRANCH_COUNTS[name] ?? 0;
            const fbUrl = s.websiteUrl || 'facebook.com/supermarket/offers';

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#EAE5D9] p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-[#D5CEBF] hover:shadow-md transition-all"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <SupermarketLogo
                      logoPath={s.logoPath}
                      name={name}
                      className="w-12 h-12 sm:w-14 sm:h-14"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-[#1A2E26] m-0 truncate leading-snug">
                        {name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="shrink-0"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{s.address || 'Cairo, Egypt'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch Pill */}
                  <span className="px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DFD3] rounded-md text-[11px] font-bold text-[#1A2E26] shrink-0">
                    {branches} Branches
                  </span>
                </div>

                <div className="w-full h-px bg-[#EAE5D9]" />

                {/* Scraper Endpoint Section */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SCRAPER ENDPOINT
                  </span>
                  <div className="bg-[#FAF8F5] border border-[#EAE5D9] rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-400 shrink-0"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span className="text-xs font-mono text-slate-700 truncate">
                        {fbUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </div>

                    <a
                      href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#1A2E26] shrink-0"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => void handleEditSupermarket(s)}
                    disabled={loadingEditId === s.id}
                    className="flex-1 py-2 bg-white border border-[#EAE5D9] rounded-xl text-xs font-bold text-[#1A2E26] hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingEditId === s.id ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="animate-spin"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="m18.5 2.5 2 2L10 15H8v-2z" />
                      </svg>
                    )}
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteTarget({ id: s.id, name })}
                    className="w-9 h-9 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    title="Delete Chain"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="m10 11 0 6m4-6 0 6" />
                      <path d="m9 6 1-3h4l1 3" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Register New Chain Card (Dashed Card matching Stitch) */}
          <div
            onClick={() => setMarketModal({ open: true })}
            className="bg-[#FAF8F5]/60 border-2 border-dashed border-[#D5CEBF] hover:border-[#1B4332] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all min-h-[220px] group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#EAE5D9] group-hover:border-[#1B4332] flex items-center justify-center text-[#1A2E26] text-xl font-light transition-colors shadow-xs">
              +
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A2E26] m-0 mb-1 group-hover:text-[#1B4332]">
                Register New Chain
              </h3>
              <p className="text-xs text-slate-500 m-0 max-w-[220px] leading-relaxed">
                Add a new supermarket configuration to the ingestion pipeline.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ── Table View ── */
        <div className="bg-white rounded-2xl border border-[#EAE5D9] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE5D9] bg-[#FAF8F5] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Supermarket Chain</th>
                  <th className="px-5 py-3">Branches</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Scraper Endpoint</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5D9]">
                {filtered.map((s) => {
                  const name = getLocalString(s.name);
                  const branches = s.branches ?? BRANCH_COUNTS[name] ?? 0;
                  const fbUrl = s.websiteUrl || 'facebook.com/supermarket/offers';

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <SupermarketLogo
                            logoPath={s.logoPath}
                            name={name}
                            className="w-9 h-9 text-xs"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#1A2E26]">{name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {s.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-[#F4EFE6] border border-[#E5DFD3] rounded-md text-[11px] font-bold text-[#1A2E26]">
                          {branches} Branches
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {s.address || 'Cairo, Egypt'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                        {fbUrl.replace(/^https?:\/\//, '')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => void handleEditSupermarket(s)}
                            disabled={loadingEditId === s.id}
                            className="px-3 py-1 rounded-lg border border-[#EAE5D9] text-xs font-bold text-[#1A2E26] bg-white hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loadingEditId === s.id ? 'Loading…' : 'Edit'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: s.id, name })}
                            className="px-3 py-1 rounded-lg border border-red-200 text-xs font-bold text-red-500 bg-white hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {marketModal.open && (
        <SupermarketFormModal
          initial={marketModal.editing}
          onSave={handleSaveMarket}
          onClose={() => setMarketModal({ open: false })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Supermarket Chain"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
