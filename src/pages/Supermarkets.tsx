import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { SupermarketFormModal } from '@components/supermarkets/SupermarketFormModal';
import { GridView } from '@components/supermarkets/GridView';
import { TableView } from '@components/supermarkets/TableView';
import { ViewToolbar } from '@components/ui/ViewToolbar';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { useSupermarkets } from '@hooks/useSupermarkets';
import { useTranslation } from 'react-i18next';

function SupermarketGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3.5 rounded w-3/4 mb-2" />
              <Skeleton className="h-2.5 rounded w-1/2" />
            </div>
          </div>
          <Skeleton className="h-9 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function SupermarketTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="divide-y divide-[#EAE5D9]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3 rounded w-1/3 mb-1.5" />
              <Skeleton className="h-2.5 rounded w-1/5" />
            </div>
            <Skeleton className="h-5 w-16 rounded-2xl shrink-0" />
            <Skeleton className="h-3 w-24 rounded shrink-0 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
        viewMode === 'grid' ? (
          <SupermarketGridSkeleton />
        ) : (
          <SupermarketTableSkeleton />
        )
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
