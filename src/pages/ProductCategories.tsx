import { cn } from '@lib/utils';
import { productCategoryService } from '@services/productCategoryService';
import DeleteConfirmation from '../components/productCategories/DeleteConfirmation';
import GridView from '../components/productCategories/Grid';
import Header from '../components/productCategories/Header';
import TableView from '../components/productCategories/Table';
import useProductCategories from '../hooks/useProductCategories';

export default function ProductCategories() {
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
  } = useProductCategories();

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-4 sm:px-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fade-in">
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

      {/* Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAdd={() => handleOpenModal()}
      />

      {/* Main content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium">
          Loading product categories...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
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
          <p className="text-sm font-bold text-slate-700 m-0">No categories found</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-xs font-bold text-emerald-700 hover:underline bg-transparent cursor-pointer border-none"
          >
            Create first category →
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <GridView categories={filtered} onEdit={handleOpenModal} onUpload={handleTriggerUpload} />
      ) : (
        <TableView categories={filtered} onEdit={handleOpenModal} onUpload={handleTriggerUpload} />
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
            <h2 className="text-lg font-bold mb-4">
              {modalState.editing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}
              {/* English / Arabic names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    English Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={enName}
                    onChange={(e) => setEnName(e.target.value)}
                    placeholder="e.g. Meat & Seafood"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-slate-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">
                    Arabic Name
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={arName}
                    onChange={(e) => setArName(e.target.value)}
                    placeholder="مثال: لحوم وأسماك"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white font-arabic text-right focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Premium cuts of beef, poultry, and fresh ocean catches."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-slate-400"
                />
              </div>

              {/* Cover Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  Cover Image
                </label>
                {coverPreview ? (
                  <div className="relative w-full sm:w-auto sm:min-w-[220px] h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs cursor-pointer hover:bg-slate-100">
                        Change
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
                      <button
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
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 border-none"
                      >
                        Remove
                      </button>
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
                    <span className="text-xs font-bold text-slate-700">
                      Click to select cover image
                    </span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WEBP recommended</span>
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
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1F3D32] hover:bg-[#162D25] transition-all shadow-xs flex items-center gap-2',
                    saving && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Category...
                    </>
                  ) : (
                    'Save Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
