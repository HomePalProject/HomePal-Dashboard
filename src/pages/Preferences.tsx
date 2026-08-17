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

import { getCategoryColor, getLocalString } from '@lib/formatters';
import { fetchBilingual } from '@lib/localization';
import { ActionBtn } from '@components/ui/ActionBtn';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { PreferenceFormModal } from '@components/preferences/PreferenceFormModal';
import { CategoryFormModal } from '@components/preferences/CategoryFormModal';

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
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

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

  const handleEditPreference = async (pref: PreferenceResponse) => {
    setLoadingEditId(pref.id);
    try {
      const { en, ar } = await fetchBilingual((lang) =>
        preferencesService.getPreferenceById(pref.id, lang)
      );
      setPrefModal({
        open: true,
        editing: {
          ...pref,
          name: [
            { culture: 'en', value: getLocalString(en.name) },
            { culture: 'ar', value: getLocalString(ar.name) },
          ],
          description: [
            { culture: 'en', value: (en.description as string) || '' },
            { culture: 'ar', value: (ar.description as string) || '' },
          ],
        },
      });
    } catch {
      setFetchError('Could not load both languages — showing available data only.');
      setPrefModal({ open: true, editing: pref });
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleEditCategory = async (cat: PreferenceCategoryResponse) => {
    setLoadingEditId(cat.id);
    try {
      const { en, ar } = await fetchBilingual((lang) =>
        preferencesService.getPreferenceCategoryById(cat.id, lang)
      );
      setCatModal({
        open: true,
        editing: {
          ...cat,
          name: [
            { culture: 'en', value: getLocalString(en.name) },
            { culture: 'ar', value: getLocalString(ar.name) },
          ],
          description: [
            { culture: 'en', value: (en.description as string) || '' },
            { culture: 'ar', value: (ar.description as string) || '' },
          ],
        },
      });
    } catch {
      setFetchError('Could not load both languages — showing available data only.');
      setCatModal({ open: true, editing: cat });
    } finally {
      setLoadingEditId(null);
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
          getLocalString(c.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
          getLocalString(c.description).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;
  const displayedItems = isPrefsTab ? preferences : filteredCats;

  const cols = isPrefsTab ? 'grid-cols-[2fr_1.2fr_3fr_96px]' : 'grid-cols-[2fr_3fr_96px]';
  const headers = isPrefsTab
    ? ['Preference Name', 'Category', 'Description', 'Actions']
    : ['Category Name', 'Description', 'Actions'];

  return (
    <div className="w-full py-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-7 gap-16">
        <div>
          <h1 className="text-24 sm:text-28 font-bold text-text-primary m-0">System Preferences</h1>
          <p className="text-sm text-text-secondary mt-1.5 mb-0">
            Configure the intelligent logic and global categorizations for the HomePal ecosystem.
          </p>
        </div>
        <button
          onClick={() => (isPrefsTab ? setPrefModal({ open: true }) : setCatModal({ open: true }))}
          className="flex items-center gap-[8px] px-20 py-2.5 bg-primary text-white border-none rounded-[10px] cursor-pointer text-sm font-semibold whitespace-nowrap"
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

      <div className="flex border-b-[1.5px] border-border mb-24">
        {(['preferences', 'categories'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
              setFilterCategoryId('');
            }}
            className={cn(
              'px-20 py-2.5 border-0 bg-transparent cursor-pointer text-sm font-semibold -mb-0.5 border-b-2',
              activeTab === tab
                ? 'text-primary border-primary font-bold'
                : 'text-text-secondary border-transparent'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-12 items-center mb-20 flex-wrap">
        <div className="relative flex-1 min-w-45 max-w-75">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-12 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPrefsTab ? 'Search preferences…' : 'Search categories…'}
            className="w-full pl-9 pr-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
          />
        </div>
        {isPrefsTab && (
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full max-w-50 px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getLocalString(c.name)}
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
        <div className="px-4 py-12 bg-status-error-container text-status-error rounded-lg text-13 mb-4">
          {fetchError}
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <div className={cn('grid px-20 py-12 border-b border-border bg-surface-variant', cols)}>
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
                  'grid px-20 py-4 items-center transition-colors duration-150 hover:bg-surface-variant',
                  i < preferences.length - 1 && 'border-b border-border',
                  cols
                )}
              >
                <span className="text-sm font-semibold text-text-primary">
                  {getLocalString(pref.name)}
                </span>
                <span
                  className={cn(
                    'inline-block px-2.5 py-0.75 rounded-full text-[11px] font-bold tracking-wider uppercase w-fit',
                    badge.bg,
                    badge.text
                  )}
                >
                  {pref.categoryName}
                </span>
                <span className="text-13 text-text-secondary leading-relaxed">
                  {getLocalString(pref.description)}
                </span>
                <div className="flex gap-[8px]">
                  <ActionBtn
                    icon="edit"
                    title="Edit"
                    loading={loadingEditId === pref.id}
                    onClick={() => void handleEditPreference(pref)}
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
                'grid px-20 py-4 items-center transition-colors duration-150 hover:bg-surface-variant',
                i < filteredCats.length - 1 && 'border-b border-border',
                cols
              )}
            >
              <span className="text-sm font-semibold text-text-primary">
                {getLocalString(cat.name)}
              </span>
              <span className="text-13 text-text-secondary leading-relaxed">
                {getLocalString(cat.description)}
              </span>
              <div className="flex gap-[8px]">
                <ActionBtn
                  icon="edit"
                  title="Edit"
                  loading={loadingEditId === cat.id}
                  onClick={() => void handleEditCategory(cat)}
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
          title="Confirm Delete"
          confirmLabel="Delete"
          message={
            deleteTarget.type === 'preference'
              ? `Are you sure you want to delete "${getLocalString(deleteTarget.item.name)}"? This cannot be undone.`
              : `Are you sure you want to delete the category "${getLocalString(deleteTarget.item.name)}"? All preferences in this category may be affected.`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
