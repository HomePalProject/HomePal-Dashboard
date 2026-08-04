import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Types ────────────────────────────────────────────────────────────────────

interface Supermarket {
  id: string;
  name: any;
  branches?: number;
}

interface Offer {
  id: string;
  title: any;
  supermarketId?: string;
  supermarketName?: string;
  categoryName?: string;
  categoryId?: string;
  price?: number;
  status?: string;
}

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
      let errorMsg = json?.message ?? json?.title ?? `Request failed (${res.status})`;
      if (json?.errors) {
        if (Array.isArray(json.errors)) {
          errorMsg +=
            ' - ' + json.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
        } else if (typeof json.errors === 'object') {
          errorMsg += ' - ' + Object.values(json.errors).flat().join(', ');
        }
      }
      return { data: null, error: errorMsg };
    }
    const data = json?.data !== undefined ? json.data : (json as T);
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

// ── UI Components ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--sys-border)',
  fontSize: 14,
  outline: 'none',
  background: 'var(--sys-surface)',
  color: 'var(--sys-text-primary)',
  boxSizing: 'border-box',
};

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
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--sys-text-primary)',
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: 'var(--sys-status-error)' }}>*</span>}
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 440,
          padding: 32,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--sys-text-primary)',
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}
        >
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
    <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          flex: 1,
          padding: '10px 0',
          border: '1.5px solid var(--sys-border)',
          borderRadius: 8,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--sys-text-secondary)',
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        style={{
          flex: 1,
          padding: '10px 0',
          border: 'none',
          borderRadius: 8,
          background: 'var(--sys-primary)',
          color: '#fff',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}
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
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spinneys"
            required
          />
        </Field>
        {error && (
          <p style={{ color: 'var(--sys-status-error)', fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}
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
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Organic Gala Apples 1kg"
            required
          />
        </Field>
        <Field label="Supermarket">
          <select
            style={{ ...inputStyle, appearance: 'none' }}
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
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Field label="Price (AED)">
              <input
                type="number"
                step="0.01"
                style={inputStyle}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 12.50"
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Status">
              <select
                style={{ ...inputStyle, appearance: 'none' }}
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
        {error && (
          <p style={{ color: 'var(--sys-status-error)', fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}
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
      <p style={{ color: 'var(--sys-text-secondary)', fontSize: 14, marginBottom: 24 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '9px 20px',
            border: '1.5px solid var(--sys-border)',
            borderRadius: 8,
            background: 'none',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: '9px 20px',
            border: 'none',
            borderRadius: 8,
            background: 'var(--sys-status-error)',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
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
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${highlight ? 'var(--sys-status-error)' : 'var(--sys-border)'}`,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: highlight ? '0 4px 12px rgba(217, 83, 79, 0.08)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {highlight && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: 'var(--sys-status-error)',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: highlight ? 'var(--sys-status-error-container)' : 'var(--sys-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: highlight ? 'var(--sys-status-error)' : 'var(--sys-text-secondary)',
          }}
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
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sys-text-secondary)' }}>
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: highlight ? 'var(--sys-status-error)' : 'var(--sys-text-primary)',
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: highlight ? 'var(--sys-status-error)' : 'var(--sys-text-secondary)',
          background: highlight ? 'transparent' : 'var(--sys-surface)',
          padding: highlight ? 0 : '4px 8px',
          borderRadius: 4,
          width: 'fit-content',
        }}
      >
        {subValue}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = '#eefdf4';
  let color = '#207245';
  if (s.includes('fail') || s.includes('action') || s.includes('error')) {
    bg = '#fef2f2';
    color = '#b91c1c';
  } else if (s.includes('progress') || s.includes('pending') || s.includes('review')) {
    bg = '#fffbeb';
    color = '#b45309';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: bg,
        color,
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: `1px solid ${color}20`,
      }}
    >
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
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid var(--sys-border)',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? 'var(--sys-status-error)' : 'var(--sys-text-secondary)',
      }}
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
  const token = useAuthStore((s) => s.token);

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

    const [offersRes, supermarketsRes] = await Promise.all([
      apiFetch<Offer[]>('/api/offers', token),
      apiFetch<Supermarket[]>('/api/supermarkets', token),
    ]);

    setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
    setSupermarkets(Array.isArray(supermarketsRes.data) ? supermarketsRes.data : []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOffers = offers.filter((o) =>
    getLocalString(o.title).toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions
  const handleSaveMarket = async (data: any) => {
    const isEdit = !!marketModal.editing;
    const path = isEdit ? `/api/supermarkets/${marketModal.editing!.id}` : '/api/supermarkets';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = isEdit ? { ...data, id: marketModal.editing!.id } : data;

    const res = await apiFetch(path, token, { method, body: JSON.stringify(payload) });
    if (!res.error) fetchData();
    return res.error;
  };

  const handleSaveOffer = async (data: any) => {
    const isEdit = !!offerModal.editing;
    const path = isEdit ? `/api/offers/${offerModal.editing!.id}` : '/api/offers';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = isEdit ? { ...data, id: offerModal.editing!.id } : data;

    const res = await apiFetch(path, token, { method, body: JSON.stringify(payload) });
    if (!res.error) fetchData();
    return res.error;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const path =
      deleteTarget.type === 'supermarket'
        ? `/api/supermarkets/${deleteTarget.id}`
        : `/api/offers/${deleteTarget.id}`;
    const res = await apiFetch(path, token, { method: 'DELETE' });
    setDeleting(false);
    if (!res.error) {
      setDeleteTarget(null);
      fetchData();
    } else {
      alert(`Delete failed: ${res.error}`);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
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
            Offers & Supermarkets Management
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--sys-text-secondary)',
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Monitor AI flyer ingestion, manage store catalog, and audit supermarket branches.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setOfferModal({ open: true })}
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
              color: 'var(--sys-primary)',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
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
              boxShadow: '0 2px 4px rgba(53, 104, 89, 0.2)',
            }}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Offers Table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--sys-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            gridColumn: 'span 2',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--sys-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#faf8f3',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sys-text-primary)' }}>
              Supermarket Offers & Catalog
            </h2>
            <div style={{ position: 'relative' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sys-text-secondary)"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search offers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '8px 12px 8px 34px',
                  borderRadius: 8,
                  border: '1px solid var(--sys-border)',
                  fontSize: 13,
                  width: 200,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ background: '#fff', borderBottom: '1px solid var(--sys-border)' }}>
                  <th
                    style={{
                      padding: '16px 24px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--sys-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
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
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Offer Title
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--sys-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
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
                      letterSpacing: '0.05em',
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      padding: '16px 24px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--sys-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Status
                  </th>
                  <th style={{ padding: '16px 24px', width: 80 }}></th>
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
                      style={{
                        borderBottom:
                          i < filteredOffers.length - 1 ? '1px solid var(--sys-border)' : 'none',
                        background: isAction ? '#fff5f5' : '#fff',
                      }}
                    >
                      <td
                        style={{
                          padding: '16px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'var(--sys-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--sys-border)',
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--sys-primary)',
                          }}
                        >
                          {getLocalString(offer.supermarketName || offer.title).charAt(0)}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--sys-text-primary)',
                          }}
                        >
                          {getLocalString(offer.supermarketName) || 'Unknown'}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          fontSize: 13,
                          color: 'var(--sys-text-primary)',
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {getLocalString(offer.title)}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          fontSize: 13,
                          color: 'var(--sys-text-secondary)',
                        }}
                      >
                        {getLocalString(offer.categoryName) || '—'}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          fontSize: 13,
                          color: 'var(--sys-text-secondary)',
                        }}
                      >
                        {offer.price !== undefined && offer.price !== null
                          ? `AED ${offer.price.toFixed(2)}`
                          : '---'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <StatusBadge status={s} />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                    <td
                      colSpan={6}
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'var(--sys-text-secondary)',
                        fontSize: 14,
                      }}
                    >
                      No offers found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'var(--sys-text-secondary)',
                        fontSize: 14,
                      }}
                    >
                      Loading offers...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Supermarket Chains */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: 'span 1' }}>
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
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--sys-text-primary)',
                marginBottom: 4,
              }}
            >
              Supermarket Chains
            </h2>
            <p style={{ fontSize: 13, color: 'var(--sys-text-secondary)', marginBottom: 20 }}>
              Manage branches and brand assets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {loading && (
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--sys-text-secondary)',
                    padding: 20,
                    fontSize: 13,
                  }}
                >
                  Loading chains...
                </div>
              )}
              {!loading &&
                supermarkets.map((market) => (
                  <div
                    key={market.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: '1px solid var(--sys-border)',
                      borderRadius: 8,
                      background: '#faf8f3',
                      cursor: 'pointer',
                      transition: 'border-color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sys-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sys-border)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: '#fff',
                          border: '1px solid var(--sys-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--sys-primary)',
                        }}
                      >
                        {getLocalString(market.name).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--sys-text-primary)',
                          }}
                        >
                          {getLocalString(market.name)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--sys-text-secondary)' }}>
                          {market.branches || Math.floor(Math.random() * 50) + 5} Branches
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
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
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--sys-text-secondary)',
                    padding: 20,
                    fontSize: 13,
                  }}
                >
                  No supermarkets found.
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: '1px solid var(--sys-border)',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--sys-primary)',
                  cursor: 'pointer',
                }}
              >
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
          onClose={() => setMarketModal({ open: false })}
        />
      )}

      {offerModal.open && (
        <OfferFormModal
          initial={offerModal.editing}
          supermarkets={supermarkets}
          onSave={handleSaveOffer}
          onClose={() => setOfferModal({ open: false })}
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
