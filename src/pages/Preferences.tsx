import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreferenceResponse {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt?: string;
}

interface PreferenceCategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AddPreferenceRequest {
  name: string;
  description?: string;
  categoryId: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
}

type Tab = 'preferences' | 'categories';

// ── Constants ─────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_BASE_URL ?? '';

function getCategoryColor(name: string): { bg: string; text: string } {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { bg: 'rgba(53,104,89,0.12)', text: '#356859' },
    { bg: 'rgba(245,158,11,0.12)', text: '#b45309' },
    { bg: 'rgba(59,130,246,0.12)', text: '#1d4ed8' },
    { bg: 'rgba(139,92,246,0.12)', text: '#6d28d9' },
    { bg: 'rgba(239,68,68,0.12)', text: '#b91c1c' },
    { bg: 'rgba(20,184,166,0.12)', text: '#0f766e' },
  ];
  return palettes[hash % palettes.length] ?? { bg: 'rgba(53,104,89,0.12)', text: '#356859' };
}

// ── API helper ────────────────────────────────────────────────────────────────

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
    const json: unknown = await res.json();
    if (!res.ok) {
      const errJson = json as { message?: string; title?: string; errors?: any };
      let errorMsg = errJson?.message ?? errJson?.title ?? `Request failed (${res.status})`;
      if (errJson?.errors) {
        if (Array.isArray(errJson.errors)) {
          errorMsg +=
            ' - ' + errJson.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
        } else if (typeof errJson.errors === 'object') {
          errorMsg += ' - ' + Object.values(errJson.errors).flat().join(', ');
        }
      }
      return { data: null, error: errorMsg };
    }
    const wrapped = json as { data?: T };
    const data = wrapped?.data !== undefined ? wrapped.data : (json as T);
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error. Please try again.' };
  }
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid var(--sys-border)',
  borderRadius: 8,
  fontSize: 14,
  color: 'var(--sys-text-primary)',
  background: 'var(--sys-background)',
  outline: 'none',
  boxSizing: 'border-box',
};

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
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--sys-surface)',
          borderRadius: 16,
          padding: 32,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--sys-text-primary)', margin: 0 }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sys-text-secondary)',
              display: 'flex',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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
        {label}
        {required && <span style={{ color: 'var(--sys-status-error)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--sys-text-secondary)',
            marginTop: 4,
            margin: '4px 0 0',
          }}
        >
          {hint}
        </p>
      )}
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
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
      <button
        type="button"
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
        type="submit"
        disabled={saving}
        style={{
          padding: '9px 24px',
          border: 'none',
          borderRadius: 8,
          background: 'var(--sys-primary)',
          color: '#fff',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          opacity: saving ? 0.75 : 1,
        }}
      >
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

function ActionBtn({
  icon,
  title,
  danger,
  onClick,
}: {
  icon: 'edit' | 'delete';
  title: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--sys-border)',
        borderRadius: 7,
        background: 'none',
        cursor: 'pointer',
        color: danger ? 'var(--sys-status-error)' : 'var(--sys-text-secondary)',
        transition: 'background 150ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'var(--sys-status-error-container)'
          : 'var(--sys-background)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
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
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
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
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      )}
    </button>
  );
}

// ── Preference Form ───────────────────────────────────────────────────────────

function PreferenceFormModal({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial?: PreferenceResponse;
  categories: PreferenceCategoryResponse[];
  onSave: (d: AddPreferenceRequest) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
    });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Preference' : 'Add Preference'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Name" required hint="2–100 characters">
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vegan, Gluten-Free, Nut Allergy"
            minLength={2}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Category" required>
          <select
            style={{ ...inputStyle, appearance: 'none' as const }}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" hint="Optional — max 300 characters">
          <textarea
            style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe this preference (e.g., No dairy products)..."
            maxLength={300}
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
          label={initial ? 'Save Changes' : 'Add Preference'}
        />
      </form>
    </Modal>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────────

function CategoryFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: PreferenceCategoryResponse;
  onSave: (d: CreateCategoryRequest) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({ name: name.trim(), description: description.trim() || undefined });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Category' : 'Add Category'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Name" required hint="2–100 characters">
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dietary Restrictions"
            minLength={2}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Description" hint="Optional — max 300 characters">
          <textarea
            style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this category covers (e.g., Food allergies and diets)..."
            maxLength={300}
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
          label={initial ? 'Save Changes' : 'Add Category'}
        />
      </form>
    </Modal>
  );
}

// ── Confirm Delete ────────────────────────────────────────────────────────────

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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Preferences() {
  const token = useAuthStore((s) => s.token);

  const [activeTab, setActiveTab] = useState<Tab>('preferences');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [preferences, setPreferences] = useState<PreferenceResponse[]>([]);
  const [categories, setCategories] = useState<PreferenceCategoryResponse[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [prefModal, setPrefModal] = useState<{ open: boolean; editing?: PreferenceResponse }>({
    open: false,
  });
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: PreferenceCategoryResponse }>(
    { open: false }
  );
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'preference'; item: PreferenceResponse }
    | { type: 'category'; item: PreferenceCategoryResponse }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    const { data, error } = await apiFetch<PreferenceCategoryResponse[]>(
      '/api/preferences/categories',
      token
    );
    if (error) setFetchError(error);
    else setCategories(data ?? []);
    setLoadingCats(false);
  }, [token]);

  const fetchPreferences = useCallback(async () => {
    setLoadingPrefs(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (filterCategoryId) params.set('categoryId', filterCategoryId);
    const endpoint = searchQuery
      ? `/api/preferences/search?${params.toString()}`
      : `/api/preferences?${params.toString()}`;
    const { data, error } = await apiFetch<PreferenceResponse[]>(endpoint, token);
    if (error) setFetchError(error);
    else setPreferences(data ?? []);
    setLoadingPrefs(false);
  }, [token, searchQuery, filterCategoryId]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleSavePreference = async (data: AddPreferenceRequest): Promise<string | null> => {
    const payload = {
      categoryId: data.categoryId,
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const editing = prefModal.editing;
    const { error } = editing
      ? await apiFetch(`/api/preferences/${editing.id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ ...payload, id: editing.id }),
        })
      : await apiFetch('/api/preferences', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    if (!error) await fetchPreferences();
    return error;
  };

  const handleSaveCategory = async (data: CreateCategoryRequest): Promise<string | null> => {
    const payload = {
      name: [{ languageCode: 'en', value: data.name }],
      description: data.description ? [{ languageCode: 'en', value: data.description }] : undefined,
    };
    const editing = catModal.editing;
    const { error } = editing
      ? await apiFetch(`/api/preferences/categories/${editing.id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ ...payload, id: editing.id }),
        })
      : await apiFetch('/api/preferences/categories', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    if (!error) {
      await fetchCategories();
      await fetchPreferences();
    }
    return error;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const path =
      deleteTarget.type === 'preference'
        ? `/api/preferences/${deleteTarget.item.id}`
        : `/api/preferences/categories/${deleteTarget.item.id}`;
    const { error } = await apiFetch(path, token, { method: 'DELETE' });
    setDeleting(false);
    if (!error) {
      setDeleteTarget(null);
      if (deleteTarget.type === 'preference') await fetchPreferences();
      else {
        await fetchCategories();
        await fetchPreferences();
      }
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const isPrefsTab = activeTab === 'preferences';
  const loading = isPrefsTab ? loadingPrefs : loadingCats;
  const filteredCats = searchQuery
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;
  const displayedItems = isPrefsTab ? preferences : filteredCats;

  const colPrefs = '2fr 1.2fr 3fr 96px';
  const colCats = '2fr 3fr 96px';
  const cols = isPrefsTab ? colPrefs : colCats;
  const headers = isPrefsTab
    ? ['Preference Name', 'Category', 'Description', 'Actions']
    : ['Category Name', 'Description', 'Actions'];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 28, fontWeight: 700, color: 'var(--sys-text-primary)', margin: 0 }}
          >
            System Preferences
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--sys-text-secondary)',
              marginTop: 6,
              margin: '6px 0 0',
            }}
          >
            Configure the intelligent logic and global categorizations for the HomePal ecosystem.
          </p>
        </div>
        <button
          onClick={() => (isPrefsTab ? setPrefModal({ open: true }) : setCatModal({ open: true }))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--sys-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap' as const,
          }}
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
          {isPrefsTab ? 'Add Preference' : 'Add Category'}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{ display: 'flex', borderBottom: '1.5px solid var(--sys-border)', marginBottom: 24 }}
      >
        {(['preferences', 'categories'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
              setFilterCategoryId('');
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab ? 'var(--sys-primary)' : 'var(--sys-text-secondary)',
              borderBottom:
                activeTab === tab ? '2.5px solid var(--sys-primary)' : '2.5px solid transparent',
              marginBottom: -1.5,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap' as const,
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 300 }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--sys-text-secondary)"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none' as const,
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPrefsTab ? 'Search preferences…' : 'Search categories…'}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        {isPrefsTab && (
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            style={{ ...inputStyle, maxWidth: 200, appearance: 'none' as const }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--sys-text-secondary)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
          }}
        >
          {loading
            ? '…'
            : `${displayedItems.length} item${displayedItems.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {/* Error */}
      {fetchError && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--sys-status-error-container)',
            color: 'var(--sys-status-error)',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {fetchError}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: 'var(--sys-surface)',
          borderRadius: 12,
          border: '1px solid var(--sys-border)',
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cols,
            padding: '12px 20px',
            borderBottom: '1px solid var(--sys-border)',
            background: 'var(--sys-background)',
          }}
        >
          {headers.map((h) => (
            <span
              key={h}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--sys-text-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              padding: 48,
              textAlign: 'center' as const,
              color: 'var(--sys-text-secondary)',
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        )}

        {/* Empty state */}
        {!loading && displayedItems.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: 'center' as const,
              color: 'var(--sys-text-secondary)',
              fontSize: 14,
            }}
          >
            {searchQuery ? 'No results found.' : `No ${activeTab} yet. Add your first one!`}
          </div>
        )}

        {/* Preference rows */}
        {!loading &&
          isPrefsTab &&
          preferences.map((pref, i) => {
            const badge = getCategoryColor(pref.categoryName);
            return (
              <div
                key={pref.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: cols,
                  padding: '16px 20px',
                  borderBottom: i < preferences.length - 1 ? '1px solid var(--sys-border)' : 'none',
                  alignItems: 'center',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--sys-background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                  {pref.name}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    background: badge.bg,
                    color: badge.text,
                    width: 'fit-content',
                  }}
                >
                  {pref.categoryName}
                </span>
                <span style={{ fontSize: 13, color: 'var(--sys-text-secondary)', lineHeight: 1.5 }}>
                  {pref.description ?? '—'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionBtn
                    icon="edit"
                    title="Edit"
                    onClick={() => setPrefModal({ open: true, editing: pref })}
                  />
                  <ActionBtn
                    icon="delete"
                    title="Delete"
                    danger
                    onClick={() => setDeleteTarget({ type: 'preference', item: pref })}
                  />
                </div>
              </div>
            );
          })}

        {/* Category rows */}
        {!loading &&
          !isPrefsTab &&
          filteredCats.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: 'grid',
                gridTemplateColumns: cols,
                padding: '16px 20px',
                borderBottom: i < filteredCats.length - 1 ? '1px solid var(--sys-border)' : 'none',
                alignItems: 'center',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sys-background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sys-text-primary)' }}>
                {cat.name}
              </span>
              <span style={{ fontSize: 13, color: 'var(--sys-text-secondary)', lineHeight: 1.5 }}>
                {cat.description ?? '—'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionBtn
                  icon="edit"
                  title="Edit"
                  onClick={() => setCatModal({ open: true, editing: cat })}
                />
                <ActionBtn
                  icon="delete"
                  title="Delete"
                  danger
                  onClick={() => setDeleteTarget({ type: 'category', item: cat })}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Modals */}
      {prefModal.open && (
        <PreferenceFormModal
          initial={prefModal.editing}
          categories={categories}
          onSave={handleSavePreference}
          onClose={() => setPrefModal({ open: false })}
        />
      )}
      {catModal.open && (
        <CategoryFormModal
          initial={catModal.editing}
          onSave={handleSaveCategory}
          onClose={() => setCatModal({ open: false })}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={
            deleteTarget.type === 'preference'
              ? `Are you sure you want to delete "${deleteTarget.item.name}"? This cannot be undone.`
              : `Are you sure you want to delete the category "${deleteTarget.item.name}"? All preferences in this category may be affected.`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
