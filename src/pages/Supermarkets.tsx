import { useState, useEffect, useCallback } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { catalogService } from '@services/catalogService';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';

import { getLocalString } from '@lib/formatters';
import { ActionBtn } from '@components/ui/ActionBtn';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { StatusBadge } from '@components/ui/StatusBadge';
import { SupermarketFormModal } from '@components/supermarkets/SupermarketFormModal';
import { OfferFormModal } from '@components/supermarkets/OfferFormModal';
import { StatCard } from '@components/supermarkets/StatCard';

export default function Supermarkets() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [marketModal, setMarketModal] = useState<{ open: boolean; editing?: Supermarket }>({
    open: false,
  });
  const [offerModal, setOfferModal] = useState<{ open: boolean; editing?: Offer }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'supermarket' | 'offer';
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [offersRes, supermarketsRes] = await Promise.all([
        catalogService.getOffers(),
        catalogService.getSupermarkets(),
      ]);

      setOffers(Array.isArray(offersRes) ? offersRes : []);
      setSupermarkets(Array.isArray(supermarketsRes) ? supermarketsRes : []);
    } catch (e) {
      console.error(e);
      setOffers([]);
      setSupermarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredOffers = offers.filter((o) =>
    getLocalString(o.title).toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions
  const handleSaveMarket = async (data: any) => {
    try {
      await catalogService.saveSupermarket(data, marketModal.editing?.id);
      void fetchData();
      return null;
    } catch (error: any) {
      return getErrorMessage(error);
    }
  };

  const handleSaveOffer = async (data: any) => {
    try {
      await catalogService.saveOffer(data, offerModal.editing?.id);
      void fetchData();
      return null;
    } catch (error: any) {
      return getErrorMessage(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'supermarket') {
        await catalogService.deleteSupermarket(deleteTarget.id);
      } else {
        await catalogService.deleteOffer(deleteTarget.id);
      }
      setDeleteTarget(null);
      void fetchData();
    } catch (error: any) {
      alert(`Delete failed: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-300 mx-auto flex flex-col gap-8 font-sans pb-15">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start flex-wrap gap-20">
        <div>
          <h1 className="text-28 font-extrabold text-text-primary tracking-tight mb-[8px] m-0">
            Offers & Supermarkets Management
          </h1>
          <p className="text-sm text-text-secondary max-w-150 leading-relaxed m-0">
            Monitor AI flyer ingestion, manage store catalog, and audit supermarket branches.
          </p>
        </div>
        <div className="flex gap-12 flex-wrap">
          <button
            onClick={() => setOfferModal({ open: true })}
            className="flex items-center gap-[8px] px-16 py-2.5 bg-white border border-border rounded-lg text-13 font-semibold text-primary cursor-pointer shadow-sm hover:bg-surface-variant transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Offer (Manual)
          </button>
          <button
            onClick={() => setMarketModal({ open: true })}
            className="flex items-center gap-[8px] px-16 py-2.5 bg-primary text-white border-none rounded-lg text-13 font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            Add Supermarket
          </button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20">
        <StatCard title="Total Flyers Processed" value="1,248" subValue="Last 30 days" />
        <StatCard title="Successful Parses" value="1,192" subValue="95.5% Success Rate" />
        <StatCard
          title="Failed / Pending Audit"
          value="56"
          subValue={
            <span className="flex items-center gap-1">
              Review Required
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
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          }
          highlight
        />
        <StatCard
          title="Active Offers"
          value={offers.length}
          subValue={`Across ${supermarkets.length} chains`}
        />
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start">
        {/* Left Column: Offers Table */}
        <div className="bg-white rounded-xl border border-border flex flex-col overflow-hidden lg:col-span-2">
          <div className="px-24 py-20 border-b border-border flex justify-between items-center bg-[#faf8f3] flex-wrap gap-4">
            <h2 className="text-[15px] font-bold text-text-primary m-0">
              Supermarket Offers & Catalog
            </h2>
            <div className="relative">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-12 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search offers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-12 py-[8px] rounded-lg border border-border text-13 w-50 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-175">
              <thead>
                <tr className="bg-white border-b border-border">
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Supermarket
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Offer Title
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Price
                  </th>
                  <th className="px-24 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-24 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => {
                  const s = offer.status || 'Success';
                  const isAction =
                    s.toLowerCase().includes('action') || s.toLowerCase().includes('fail');
                  return (
                    <tr
                      key={offer.id}
                      className={cn(
                        'border-b border-border transition-colors hover:bg-surface-variant/50',
                        isAction && 'bg-[#fff5f5]'
                      )}
                    >
                      <td className="px-24 py-4 flex items-center gap-12">
                        <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center border border-border text-[10px] font-bold text-primary shrink-0">
                          {getLocalString(offer.supermarketName || offer.title).charAt(0)}
                        </div>
                        <span className="text-13 font-semibold text-text-primary">
                          {getLocalString(offer.supermarketName) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-24 py-4 text-13 text-text-primary max-w-50 truncate">
                        {getLocalString(offer.title)}
                      </td>
                      <td className="px-24 py-4 text-13 text-text-secondary">
                        {getLocalString(offer.categoryName) || '—'}
                      </td>
                      <td className="px-24 py-4 text-13 text-text-secondary">
                        {offer.price !== undefined && offer.price !== null
                          ? `AED ${offer.price.toFixed(2)}`
                          : '---'}
                      </td>
                      <td className="px-24 py-4">
                        <StatusBadge status={s} />
                      </td>
                      <td className="px-24 py-4">
                        <div className="flex gap-[8px]">
                          <ActionBtn
                            icon="edit"
                            onClick={() => setOfferModal({ open: true, editing: offer })}
                          />
                          <ActionBtn
                            icon="delete"
                            danger
                            onClick={() =>
                              setDeleteTarget({
                                type: 'offer',
                                id: offer.id,
                                name: getLocalString(offer.title),
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOffers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-text-secondary text-sm">
                      No offers found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-text-secondary text-sm">
                      Loading offers...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Supermarket Chains */}
        <div className="flex flex-col gap-24 lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-24 flex flex-col">
            <h2 className="text-[15px] font-bold text-text-primary mb-[4px] m-0">
              Supermarket Chains
            </h2>
            <p className="text-13 text-text-secondary mb-20 m-0">
              Manage branches and brand assets.
            </p>

            <div className="flex flex-col gap-12 flex-1">
              {loading && (
                <div className="text-center text-text-secondary p-20 text-13">
                  Loading chains...
                </div>
              )}
              {!loading &&
                supermarkets.map((market) => (
                  <div
                    key={market.id}
                    className="flex items-center justify-between px-4 py-12 border border-border rounded-lg bg-[#faf8f3] cursor-pointer transition-colors duration-150 hover:border-primary group"
                  >
                    <div className="flex items-center gap-12">
                      <div className="w-9 h-9 rounded-md bg-white border border-border flex items-center justify-center text-xs font-bold text-primary">
                        {getLocalString(market.name).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          {getLocalString(market.name)}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {market.branches || Math.floor(Math.random() * 50) + 5} Branches
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <ActionBtn
                        icon="edit"
                        onClick={() => setMarketModal({ open: true, editing: market })}
                      />
                      <ActionBtn
                        icon="delete"
                        danger
                        onClick={() =>
                          setDeleteTarget({
                            type: 'supermarket',
                            id: market.id,
                            name: getLocalString(market.name),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              {!loading && supermarkets.length === 0 && (
                <div className="text-center text-text-secondary p-20 text-13">
                  No supermarkets found.
                </div>
              )}
            </div>

            <div className="mt-24 pt-20 border-t border-border flex justify-center">
              <button className="flex items-center gap-[8px] bg-transparent border-none text-13 font-semibold text-primary cursor-pointer hover:opacity-80 transition-opacity">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Manage All Branches
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals */}
      {marketModal.open && (
        <SupermarketFormModal
          initial={marketModal.editing}
          onSave={handleSaveMarket}
          onClose={() => setMarketModal({ open: false, editing: undefined })}
        />
      )}

      {offerModal.open && (
        <OfferFormModal
          initial={offerModal.editing}
          supermarkets={supermarkets}
          onSave={handleSaveOffer}
          onClose={() => setOfferModal({ open: false, editing: undefined })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
