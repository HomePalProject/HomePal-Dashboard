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

import { getCategoryColor, getLocalString, getLocalizedCulture } from '@lib/formatters';
import { fetchBilingual } from '@lib/localization';
import { Button } from '@components/ui/Button';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { PreferenceFormModal } from '@components/preferences/PreferenceFormModal';
import { CategoryFormModal } from '@components/preferences/CategoryFormModal';

// ── Main Page ──
import { useTranslation } from 'react-i18next';

export default function Preferences() {
  const { t, i18n } = useTranslation(['preferences', 'common']);
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
      setFetchError(t('toastLoadBilingualError'));
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
      setFetchError(t('toastLoadBilingualError'));
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
    ? [t('headerName'), t('headerCategory'), t('headerDesc'), t('headerActions')]
    : [t('headerCatName'), t('headerDesc'), t('headerActions')];

  return (
    <div className="w-full py-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-7 gap-6 sm:gap-16">
        <div>
          <h1 className="text-24 sm:text-28 font-bold text-text-primary m-0">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1.5 mb-0">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => (isPrefsTab ? setPrefModal({ open: true }) : setCatModal({ open: true }))}
          className="flex items-center gap-2 px-6 sm:px-20 py-2.5 bg-primary text-white border-none rounded-[10px] cursor-pointer text-sm font-semibold whitespace-nowrap w-fit shrink-0"
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
          {isPrefsTab ? t('addPreference') : t('addCategory')}
        </button>
      </div>

      <div className="overflow-x-auto mb-6">
        <div className="flex border-b-[1.5px] border-border min-w-max">
          {(['preferences', 'categories'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
                setFilterCategoryId('');
              }}
              className={cn(
                'px-6 sm:px-20 py-2.5 bg-transparent cursor-pointer text-sm font-semibold -mb-[1.5px] border-b-2 whitespace-nowrap transition-colors duration-150',
                activeTab === tab
                  ? 'text-primary border-primary font-bold'
                  : 'text-text-secondary border-transparent'
              )}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 sm:items-center mb-6">
        <div className="relative flex-1 min-w-full sm:min-w-45 sm:max-w-75">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute inset-s-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPrefsTab ? t('searchPrefPlaceholder') : t('searchCatPlaceholder')}
            className="w-full ps-11 pe-4 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
          />
        </div>
        {isPrefsTab && (
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full sm:w-auto sm:max-w-50 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border appearance-none"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getLocalString(c.name)}
              </option>
            ))}
          </select>
        )}
        <span className="sm:ms-auto text-xs text-text-secondary font-semibold tracking-wider uppercase">
          {loading ? '…' : t('itemsFound', { count: displayedItems.length })}
        </span>
      </div>

      {fetchError && (
        <div className="px-4 py-12 bg-status-error-container text-status-error rounded-lg text-13 mb-4">
          {fetchError}
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <div className="min-w-200">
          <div
            className={cn(
              'grid px-5 py-4 border-b border-border bg-surface-variant items-center',
              cols,
              'gap-4'
            )}
          >
            {headers.map((h) => (
              <span
                key={h}
                className="text-[11px] font-bold text-text-secondary tracking-widest uppercase whitespace-nowrap"
              >
                {h}
              </span>
            ))}
          </div>

          {loading && (
            <div className="p-12 text-center text-text-secondary text-sm">{t('loading')}</div>
          )}

          {!loading && displayedItems.length === 0 && (
            <div className="p-12 text-center text-text-secondary text-sm">
              {searchQuery
                ? t('noResults')
                : isPrefsTab
                  ? t('noPreferencesYet')
                  : t('noCategoriesYet')}
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
                    'grid px-5 py-4 items-center transition-colors duration-150 hover:bg-surface-variant gap-4',
                    i < preferences.length - 1 && 'border-b border-border',
                    cols
                  )}
                >
                  <span className="text-sm font-semibold text-text-primary">
                    {getLocalizedCulture(pref.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                      getLocalString(pref.name)}
                  </span>
                  <span
                    className={cn(
                      'inline-block px-2.5 py-0.75 rounded-full text-[11px] font-bold tracking-wider uppercase w-fit whitespace-nowrap',
                      badge.bg,
                      badge.text
                    )}
                  >
                    {t((pref.categoryName || '').toLowerCase(), pref.categoryName)}
                  </span>
                  <span className="text-13 text-text-secondary leading-relaxed truncate">
                    {getLocalizedCulture(pref.description, i18n.resolvedLanguage as 'en' | 'ar') ||
                      getLocalString(pref.description)}
                  </span>
                  <div className="flex gap-1 justify-end sm:justify-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t('edit')}
                      disabled={loadingEditId === pref.id}
                      onClick={() => void handleEditPreference(pref)}
                      className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      {loadingEditId === pref.id ? (
                        <svg
                          width="15"
                          height="15"
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
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t('delete')}
                      onClick={() => setDeleteTarget({ type: 'preference', item: pref })}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
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
                  'grid px-6 sm:px-20 py-4 items-center transition-colors duration-150 hover:bg-surface-variant gap-4',
                  i < filteredCats.length - 1 && 'border-b border-border',
                  cols
                )}
              >
                <span className="text-sm font-semibold text-text-primary">
                  {getLocalizedCulture(cat.name, i18n.resolvedLanguage as 'en' | 'ar') ||
                    getLocalString(cat.name)}
                </span>
                <span className="text-13 text-text-secondary leading-relaxed truncate">
                  {getLocalizedCulture(cat.description, i18n.resolvedLanguage as 'en' | 'ar') ||
                    getLocalString(cat.description)}
                </span>
                <div className="flex gap-1 justify-end sm:justify-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t('edit')}
                    disabled={loadingEditId === cat.id}
                    onClick={() => void handleEditCategory(cat)}
                    className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  >
                    {loadingEditId === cat.id ? (
                      <svg
                        width="15"
                        height="15"
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
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t('delete')}
                    onClick={() => setDeleteTarget({ type: 'category', item: cat })}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
        </div>
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
          title={t('confirmDelete')}
          confirmLabel={t('delete')}
          message={
            deleteTarget.type === 'preference'
              ? t('deletePreferenceConfirm', {
                  name:
                    getLocalizedCulture(
                      deleteTarget.item.name,
                      i18n.resolvedLanguage as 'en' | 'ar'
                    ) || getLocalString(deleteTarget.item.name),
                })
              : t('deleteCategoryConfirm', {
                  name:
                    getLocalizedCulture(
                      deleteTarget.item.name,
                      i18n.resolvedLanguage as 'en' | 'ar'
                    ) || getLocalString(deleteTarget.item.name),
                })
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
