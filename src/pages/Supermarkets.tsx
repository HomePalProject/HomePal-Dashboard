import React, { useState, useEffect, useCallback } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { catalogService } from '@services/catalogService';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLocalString(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && val.length > 0) return val[0].value || '—';
  return '—';
}

function toLocalized(str: string) {
  return [{ languageCode: 'en', value: str.trim() }];
}

// ── UI Components ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
        {label} {required && <span className="text-status-error">*</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-110 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-extrabold text-text-primary mb-6 tracking-tight m-0">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  saving,
  label,
}: {
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3 mt-8">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-sm font-semibold text-text-secondary cursor-pointer hover:bg-surface-variant transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className={cn(
          'flex-1 py-2.5 bg-primary text-white border-none rounded-lg text-sm font-semibold transition-opacity',
          saving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
        )}
      >
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

// ── Feature Modals ───────────────────────────────────────────────────────────

function SupermarketFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Supermarket;
  onSave: (d: any) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial ? getLocalString(initial.name) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({ name: toLocalized(name) });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Supermarket' : 'Add Supermarket'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Supermarket Name" required>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spinneys"
            required
          />
        </Field>
        {error && <p className="text-status-error text-[13px] mb-3 m-0">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Supermarket'}
        />
      </form>
    </Modal>
  );
}

function OfferFormModal({
  initial,
  supermarkets,
  onSave,
  onClose,
}: {
  initial?: Offer;
  supermarkets: Supermarket[];
  onSave: (d: any) => Promise<string | null>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial ? getLocalString(initial.title) : '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [supermarketId, setSupermarketId] = useState(initial?.supermarketId || '');
  const [categoryId] = useState(initial?.categoryId || '');
  const [status, setStatus] = useState(initial?.status || 'Success');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: any = {
      title: toLocalized(title),
      supermarketId: supermarketId || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
    };
    if (price && !isNaN(Number(price))) {
      payload.price = Number(price);
    }
    const err = await onSave(payload);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Offer' : 'Add Offer (Manual)'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Offer Title" required>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Organic Gala Apples 1kg"
            required
          />
        </Field>
        <Field label="Supermarket">
          <select
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary appearance-none box-border"
            value={supermarketId}
            onChange={(e) => setSupermarketId(e.target.value)}
          >
            <option value="">Select a supermarket...</option>
            {supermarkets.map((m) => (
              <option key={m.id} value={m.id}>
                {getLocalString(m.name)}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-4">
          <div className="flex-1">
            <Field label="Price (AED)">
              <input
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 12.50"
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Status">
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary appearance-none box-border"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Success">Success</option>
                <option value="In Progress">In Progress</option>
                <option value="Action Required">Action Required</option>
              </select>
            </Field>
          </div>
        </div>
        {error && <p className="text-status-error text-[13px] mb-3 m-0">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Offer'}
        />
      </form>
    </Modal>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p className="text-text-secondary text-sm mb-6 m-0">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-transparent border-[1.5px] border-border rounded-lg text-sm cursor-pointer hover:bg-surface-variant transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'px-5 py-2.5 border-none rounded-lg bg-status-error text-white text-sm font-semibold transition-opacity',
            loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
          )}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subValue,
  highlight = false,
}: {
  title: string;
  value: string | number;
  subValue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden',
        highlight ? 'border-status-error shadow-[0_4px_12px_rgba(217,83,79,0.08)]' : 'border-border'
      )}
    >
      {highlight && <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error" />}

      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            highlight
              ? 'bg-status-error-container text-status-error'
              : 'bg-surface text-text-secondary'
          )}
        >
          {highlight ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          )}
        </div>
        <span className="text-[13px] font-semibold text-text-secondary">{title}</span>
      </div>

      <div
        className={cn('text-2xl font-bold', highlight ? 'text-status-error' : 'text-text-primary')}
      >
        {value}
      </div>

      <div
        className={cn(
          'text-xs font-medium w-fit rounded',
          highlight
            ? 'text-status-error bg-transparent p-0'
            : 'text-text-secondary bg-surface px-2 py-1'
        )}
      >
        {subValue}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  if (s.includes('fail') || s.includes('action') || s.includes('error')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold tracking-[0.02em] bg-red-50 text-red-700 border border-red-700/20">
        {status}
      </span>
    );
  }

  if (s.includes('progress') || s.includes('pending') || s.includes('review')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold tracking-[0.02em] bg-amber-50 text-amber-700 border border-amber-700/20">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold tracking-[0.02em] bg-green-50 text-green-700 border border-green-700/20">
      {status}
    </span>
  );
}

function ActionBtn({
  icon,
  onClick,
  danger,
}: {
  icon: 'edit' | 'delete';
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-variant',
        danger ? 'text-status-error' : 'text-text-secondary'
      )}
    >
      {icon === 'edit' ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
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
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
    </button>
  );
}

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
      <div className="flex justify-between items-start flex-wrap gap-5">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary tracking-tight mb-2 m-0">
            Offers & Supermarkets Management
          </h1>
          <p className="text-sm text-text-secondary max-w-150 leading-relaxed m-0">
            Monitor AI flyer ingestion, manage store catalog, and audit supermarket branches.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setOfferModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg text-[13px] font-semibold text-primary cursor-pointer shadow-sm hover:bg-surface-variant transition-colors"
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
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Flyers Processed" value="1,248" subValue="Last 30 days" />
        <StatCard title="Successful Parses" value="1,192" subValue="95.5% Success Rate" />
        <StatCard
          title="Failed / Pending Audit"
          value="56"
          subValue="Review Required →"
          highlight
        />
        <StatCard
          title="Active Offers"
          value={offers.length}
          subValue={`Across ${supermarkets.length} chains`}
        />
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Offers Table */}
        <div className="bg-white rounded-xl border border-border flex flex-col overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-[#faf8f3] flex-wrap gap-4">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search offers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-lg border border-border text-[13px] w-50 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-175">
              <thead>
                <tr className="bg-white border-b border-border">
                  <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Supermarket
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Offer Title
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Price
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer, i) => {
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
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center border border-border text-[10px] font-bold text-primary shrink-0">
                          {getLocalString(offer.supermarketName || offer.title).charAt(0)}
                        </div>
                        <span className="text-[13px] font-semibold text-text-primary">
                          {getLocalString(offer.supermarketName) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-primary max-w-50 truncate">
                        {getLocalString(offer.title)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">
                        {getLocalString(offer.categoryName) || '—'}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">
                        {offer.price !== undefined && offer.price !== null
                          ? `AED ${offer.price.toFixed(2)}`
                          : '---'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
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
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col">
            <h2 className="text-[15px] font-bold text-text-primary mb-1 m-0">Supermarket Chains</h2>
            <p className="text-[13px] text-text-secondary mb-5 m-0">
              Manage branches and brand assets.
            </p>

            <div className="flex flex-col gap-3 flex-1">
              {loading && (
                <div className="text-center text-text-secondary p-5 text-[13px]">
                  Loading chains...
                </div>
              )}
              {!loading &&
                supermarkets.map((market) => (
                  <div
                    key={market.id}
                    className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-[#faf8f3] cursor-pointer transition-colors duration-150 hover:border-primary group"
                  >
                    <div className="flex items-center gap-3">
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
                <div className="text-center text-text-secondary p-5 text-[13px]">
                  No supermarkets found.
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-border flex justify-center">
              <button className="flex items-center gap-2 bg-transparent border-none text-[13px] font-semibold text-primary cursor-pointer hover:opacity-80 transition-opacity">
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
