import { productCategoryService } from '@services/productCategoryService';
import DeleteConfirmation from '../components/productCategories/DeleteConfirmation';
import GridView from '../components/productCategories/Grid';
import TableView from '../components/productCategories/Table';
import { ViewToolbar } from '../components/ui/ViewToolbar';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import useProductCategories from '../hooks/useProductCategories';
import { useTranslation } from 'react-i18next';

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100"
        >
          <Skeleton className="w-full aspect-4/3 rounded-none" />
          <div className="p-5 flex flex-col gap-2">
            <Skeleton className="h-3.5 rounded w-3/4" />
            <Skeleton className="h-3 rounded w-1/2 ms-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-16 py-3">
            <Skeleton className="w-10 h-10 rounded-3xl shrink-0" />
            <Skeleton className="h-3 rounded w-1/4" />
            <Skeleton className="h-3 rounded w-1/4 ms-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductCategories() {
  const { t } = useTranslation(['categories', 'common']);
  const {
    loading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filtered,
    modalState,
    deleteTarget,
    setDeleteTarget,
    fileInputRef,
    // actions
    handleOpenModal,
    handleCloseModal,
    handleSubmitForm,
    handleDeleteCategory,
    handleTriggerUpload,
    handleDirectFileChange,
    // form fields & state
    enName,
    setEnName,
    arName,
    setArName,
    description,
    setDescription,
    setCoverFile,
    coverPreview,
    setCoverPreview,
    saving,
    formError,
    toastMessage,
    // other flags
    deleting,
    loadingEditId,
  } = useProductCategories();

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-4 px-1 sm:px-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 inset-e-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for direct upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleDirectFileChange}
        className="hidden"
      />

      {/* Control Bar */}
      <ViewToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('searchPlaceholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        primaryAction={
          <Button
            onClick={() => void handleOpenModal()}
            size="sm"
            className="w-full sm:w-auto gap-2"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('addNewCategory')}
          </Button>
        }
      />

      {/* Main content */}
      {loading ? (
        viewMode === 'grid' ? (
          <CategoryGridSkeleton />
        ) : (
          <CategoryTableSkeleton />
        )
      ) : filtered.length === 0 ? (
        <div className="py-5 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            {/* empty state icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            />
          </div>
          <p className="text-sm font-bold text-slate-700 m-0">{t('noCategories')}</p>
          <Button
            onClick={() => void handleOpenModal()}
            variant="ghost"
            size="sm"
            className="text-emerald-700 hover:underline h-auto min-h-0 p-0 bg-transparent hover:bg-transparent"
          >
            {t('createFirst')}
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <GridView
          categories={filtered}
          onEdit={(cat) => void handleOpenModal(cat)}
          onUpload={handleTriggerUpload}
          onDelete={setDeleteTarget}
          loadingEditId={loadingEditId}
        />
      ) : (
        <TableView
          categories={filtered}
          onEdit={(cat) => void handleOpenModal(cat)}
          onUpload={handleTriggerUpload}
          onDelete={setDeleteTarget}
          loadingEditId={loadingEditId}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirmation
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteCategory}
          loading={deleting}
        />
      )}

      {/* Add / Edit Modal */}
      {modalState.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">
              {modalState.editing ? t('editCategory') : t('addNewCategory')}
            </h2>
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}
              {/* English / Arabic names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold uppercase text-slate-500">
                    {t('englishName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={enName}
                    onChange={(e) => setEnName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-slate-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold uppercase text-slate-500">
                    {t('arabicName')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={arName}
                    onChange={(e) => setArName(e.target.value)}
                    placeholder="مثال: لحوم وأسماك"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-arabic text-end focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold uppercase text-slate-500">
                  {t('description')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-slate-400"
                />
              </div>

              {/* Cover Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold uppercase text-slate-500">
                  {t('coverImage')}
                </label>
                {coverPreview ? (
                  <div className="relative w-full sm:w-auto sm:min-w-[220px] h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="px-3 py-1.5 bg-white text-slate-900 rounded-3xl text-xs cursor-pointer hover:bg-slate-100">
                        {t('change')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setCoverFile(e.target.files[0]);
                              setCoverPreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                          if (modalState.editing) {
                            void productCategoryService
                              .deleteCategoryImage(modalState.editing.id)
                              .catch(() => null);
                          }
                        }}
                        variant="danger"
                        size="sm"
                      >
                        {t('remove')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-slate-400 flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="text-slate-400"
                    />
                    <span className="text-xs font-bold text-slate-700">{t('uploadDesc')}</span>
                    <span className="text-sm text-slate-400">{t('uploadFormats')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCoverFile(e.target.files[0]);
                          setCoverPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  size="sm"
                  className="px-4 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  size="sm"
                  className="gap-2 px-5"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
