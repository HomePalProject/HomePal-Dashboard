import { useEffect, useState, useCallback } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { preferencesService } from '@services/preferencesService';
import type {
  PreferenceResponse,
  PreferenceCategoryResponse,
  AddPreferenceRequest,
  CreateCategoryRequest,
} from '@typeDefs/preferencesTypes';

type Tab = 'preferences' | 'categories';

function getCategoryColor(name: string): { bg: string; text: string } {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { bg: 'bg-[#356859]/10', text: 'text-[#356859]' },
    { bg: 'bg-amber-500/10', text: 'text-amber-700' },
    { bg: 'bg-blue-500/10', text: 'text-blue-700' },
    { bg: 'bg-purple-500/10', text: 'text-purple-700' },
    { bg: 'bg-red-500/10', text: 'text-red-700' },
    { bg: 'bg-teal-500/10', text: 'text-teal-700' },
  ];
  return palettes[hash % palettes.length] ?? palettes[0];
}

// ── Shared UI ──

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
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-8 w-full max-w-120 shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-primary m-0">{title}</h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-text-secondary flex"
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
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
        {label}
        {required && <span className="text-status-error ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-secondary mt-1 mb-0">{hint}</p>}
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
    <div className="flex gap-3 justify-end mt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 border-[1.5px] border-border rounded-lg bg-transparent cursor-pointer text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className={cn(
          'px-6 py-2.5 border-none rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer',
          saving && 'opacity-75 cursor-not-allowed'
        )}
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
      className={cn(
        'w-8 h-8 flex items-center justify-center border border-border rounded-md bg-transparent cursor-pointer transition-colors duration-150',
        danger
          ? 'text-status-error hover:bg-status-error-container'
          : 'text-text-secondary hover:bg-surface-variant'
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

// ── Preference Form ──

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
            className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
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
            className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border appearance-none"
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
            className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border resize-y min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe this preference (e.g., No dairy products)..."
            maxLength={300}
          />
        </Field>
        {error && <p className="text-status-error text-[13px] mb-3">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Preference'}
        />
      </form>
    </Modal>
  );
}

// ── Category Form ──

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
            className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
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
            className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border resize-y min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this category covers (e.g., Food allergies and diets)..."
            maxLength={300}
          />
        </Field>
        {error && <p className="text-status-error text-[13px] mb-3">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Category'}
        />
      </form>
    </Modal>
  );
}

// ── Confirm Delete ──

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
      <p className="text-text-secondary text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border-[1.5px] border-border rounded-lg bg-transparent cursor-pointer text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'px-5 py-2.5 border-none rounded-lg bg-status-error text-white text-sm font-semibold cursor-pointer',
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ──

export default function Preferences() {
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

  // ── Fetch ──

  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const data = await preferencesService.getCategories();
      setCategories(data ?? []);
      setFetchError(null);
    } catch (err) {
      setFetchError(getErrorMessage(err));
    } finally {
      setLoadingCats(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    setLoadingPrefs(true);
    try {
      const data = await preferencesService.getPreferences(searchQuery, filterCategoryId);
      setPreferences(data ?? []);
      setFetchError(null);
    } catch (err) {
      setFetchError(getErrorMessage(err));
    } finally {
      setLoadingPrefs(false);
    }
  }, [searchQuery, filterCategoryId]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  // ── CRUD ──

  const handleSavePreference = async (data: AddPreferenceRequest): Promise<string | null> => {
    try {
      const editing = prefModal.editing;
      if (editing) {
        await preferencesService.updatePreference(editing.id, data);
      } else {
        await preferencesService.createPreference(data);
      }
      await fetchPreferences();
      return null;
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  const handleSaveCategory = async (data: CreateCategoryRequest): Promise<string | null> => {
    try {
      const editing = catModal.editing;
      if (editing) {
        await preferencesService.updateCategory(editing.id, data);
      } else {
        await preferencesService.createCategory(data);
      }
      await fetchCategories();
      await fetchPreferences();
      return null;
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'preference') {
        await preferencesService.deletePreference(deleteTarget.item.id);
        await fetchPreferences();
      } else {
        await preferencesService.deleteCategory(deleteTarget.item.id);
        await fetchCategories();
        await fetchPreferences();
      }
      setDeleteTarget(null);
    } catch (err) {
      setFetchError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ──

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

  const cols = isPrefsTab ? 'grid-cols-[2fr_1.2fr_3fr_96px]' : 'grid-cols-[2fr_3fr_96px]';
  const headers = isPrefsTab
    ? ['Preference Name', 'Category', 'Description', 'Actions']
    : ['Category Name', 'Description', 'Actions'];

  return (
    <div className="py-8 px-10 max-w-275 mx-auto font-sans">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary m-0">System Preferences</h1>
          <p className="text-sm text-text-secondary mt-1.5 mb-0">
            Configure the intelligent logic and global categorizations for the HomePal ecosystem.
          </p>
        </div>
        <button
          onClick={() => (isPrefsTab ? setPrefModal({ open: true }) : setCatModal({ open: true }))}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white border-none rounded-[10px] cursor-pointer text-sm font-semibold whitespace-nowrap"
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

      <div className="flex border-b-[1.5px] border-border mb-6">
        {(['preferences', 'categories'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
              setFilterCategoryId('');
            }}
            className={cn(
              'px-5 py-2.5 border-none bg-transparent cursor-pointer text-sm font-semibold mb-[-1.5px] border-b-[2.5px]',
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <div className="relative flex-1 min-w-45 max-w-75">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPrefsTab ? 'Search preferences…' : 'Search categories…'}
            className="w-full pl-9 pr-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
          />
        </div>
        {isPrefsTab && (
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full max-w-50 px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-xs text-text-secondary font-semibold tracking-wider uppercase">
          {loading
            ? '…'
            : `${displayedItems.length} item${displayedItems.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {fetchError && (
        <div className="px-4 py-3 bg-status-error-container text-status-error rounded-lg text-[13px] mb-4">
          {fetchError}
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className={cn('grid px-5 py-3 border-b border-border bg-surface-variant', cols)}>
          {headers.map((h) => (
            <span
              key={h}
              className="text-[11px] font-bold text-text-secondary tracking-widest uppercase"
            >
              {h}
            </span>
          ))}
        </div>

        {loading && <div className="p-12 text-center text-text-secondary text-sm">Loading…</div>}

        {!loading && displayedItems.length === 0 && (
          <div className="p-12 text-center text-text-secondary text-sm">
            {searchQuery ? 'No results found.' : `No ${activeTab} yet. Add your first one!`}
          </div>
        )}

        {!loading &&
          isPrefsTab &&
          preferences.map((pref, i) => {
            const badge = getCategoryColor(pref.categoryName);
            return (
              <div
                key={pref.id}
                className={cn(
                  'grid px-5 py-4 items-center transition-colors duration-150 hover:bg-surface-variant',
                  i < preferences.length - 1 && 'border-b border-border',
                  cols
                )}
              >
                <span className="text-sm font-semibold text-text-primary">{pref.name}</span>
                <span
                  className={cn(
                    'inline-block px-2.5 py-0.75 rounded-full text-[11px] font-bold tracking-wider uppercase w-fit',
                    badge.bg,
                    badge.text
                  )}
                >
                  {pref.categoryName}
                </span>
                <span className="text-[13px] text-text-secondary leading-relaxed">
                  {pref.description ?? '—'}
                </span>
                <div className="flex gap-2">
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

        {!loading &&
          !isPrefsTab &&
          filteredCats.map((cat, i) => (
            <div
              key={cat.id}
              className={cn(
                'grid px-5 py-4 items-center transition-colors duration-150 hover:bg-surface-variant',
                i < filteredCats.length - 1 && 'border-b border-border',
                cols
              )}
            >
              <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
              <span className="text-[13px] text-text-secondary leading-relaxed">
                {cat.description ?? '—'}
              </span>
              <div className="flex gap-2">
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
