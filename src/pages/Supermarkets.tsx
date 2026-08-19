import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { SupermarketFormModal } from '@components/supermarkets/SupermarketFormModal';
import { GridView } from '@components/supermarkets/GridView';
import { TableView } from '@components/supermarkets/TableView';
import { ViewToolbar } from '@components/ui/ViewToolbar';
import { Button } from '@components/ui/Button';
import { useSupermarkets } from '@hooks/useSupermarkets';
import { useTranslation } from 'react-i18next';

export default function Supermarkets() {
  const { t } = useTranslation('supermarkets');
  const {
    supermarkets,
    filtered,
    loading,
    search,
    setSearch,
    viewMode,
    setViewMode,
    marketModal,
    setMarketModal,
    deleteTarget,
    setDeleteTarget,
    deleting,
    loadingEditId,
    handleSaveMarket,
    handleEditSupermarket,
    handleDelete,
  } = useSupermarkets();

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-4 px-1 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 pb-1 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-text-secondary tracking-wide mb-1">
            {t('breadcrumbParent')} /{' '}
            <span className="font-bold text-text-primary">{t('breadcrumbChild')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight m-0">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 m-0">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('liveSync')}</span>
          </div>

          <Button
            onClick={() => setMarketModal({ open: true })}
            variant="primary"
            size="md"
            className="gap-2 shrink-0 px-5"
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
            <span>{t('addSupermarket')}</span>
          </Button>
        </div>
      </div>

      {/* ── Control Bar Card ── */}
      <ViewToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('searchPlaceholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        metaContent={
          <span className="px-3 py-1.5 bg-surface-variant border border-border rounded-full text-xs font-bold text-text-primary shrink-0">
            {t('chains', { count: supermarkets.length })}
          </span>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-3 h-3 rounded-xl bg-slate-100" />
                <div className="flex-1">
                  <div className="h-1 bg-slate-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <GridView
          supermarkets={filtered}
          loadingEditId={loadingEditId}
          onEdit={handleEditSupermarket}
          onDelete={setDeleteTarget}
          onAdd={() => setMarketModal({ open: true })}
        />
      ) : (
        <TableView
          supermarkets={filtered}
          loadingEditId={loadingEditId}
          onEdit={handleEditSupermarket}
          onDelete={setDeleteTarget}
        />
      )}

      {marketModal.open && (
        <SupermarketFormModal
          initial={marketModal.editing}
          onSave={handleSaveMarket}
          onClose={() => setMarketModal({ open: false })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t('deleteTitle')}
          message={t('deleteMessage', { name: deleteTarget.name })}
          confirmLabel={t('deleteConfirm')}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
