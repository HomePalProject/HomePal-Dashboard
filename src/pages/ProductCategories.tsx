import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn, getErrorMessage } from '@lib/utils';
import { productCategoryService } from '@services/productCategoryService';
import type { ProductCategory, CreateUpdateCategoryPayload } from '@typeDefs/productCategoryTypes';
import { getImageUrl, getLocalizedCulture } from '@lib/formatters';
import { Modal } from '@components/ui/Modal';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';

export default function ProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [modalState, setModalState] = useState<{ open: boolean; editing?: ProductCategory }>({
    open: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Direct Image Upload Trigger
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields inside Modal
  const [enName, setEnName] = useState('');
  const [arName, setArName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = searchQuery.trim()
        ? await productCategoryService.searchCategories(searchQuery.trim()).catch(() => [])
        : await productCategoryService.getCategories().catch(() => []);

      setCategories(res || []);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Open Add/Edit Modal
  const handleOpenModal = (cat?: ProductCategory) => {
    setFormError(null);
    setCoverFile(null);
    if (cat) {
      const en = typeof cat.name === 'string' ? cat.name : getLocalizedCulture(cat.name, 'en');
      const ar = getLocalizedCulture(cat.name, 'ar');
      const descEn =
        typeof cat.description === 'string'
          ? cat.description
          : getLocalizedCulture(cat.description, 'en');
      setEnName(en);
      setArName(ar);
      setDescription(descEn);
      setCoverPreview(getImageUrl(cat.imagePath));
      setModalState({ open: true, editing: cat });
    } else {
      setEnName('');
      setArName('');
      setDescription('');
      setCoverPreview(null);
      setModalState({ open: true });
    }
  };

  const handleCloseModal = () => {
    setModalState({ open: false });
    setCoverFile(null);
    setCoverPreview(null);
    setFormError(null);
  };

  // Submit Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enName.trim()) {
      setFormError('English Name is required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: CreateUpdateCategoryPayload = {
      name: [
        { culture: 'en-US', languageCode: 'en-US', value: enName.trim() },
        { culture: 'ar-EG', languageCode: 'ar-EG', value: arName.trim() || enName.trim() },
      ],
      description: [
        { culture: 'en-US', languageCode: 'en-US', value: description.trim() },
        { culture: 'ar-EG', languageCode: 'ar-EG', value: description.trim() },
      ],
      imagePath: modalState.editing?.imagePath || null,
    };

    try {
      let savedCategory: ProductCategory;
      if (modalState.editing) {
        savedCategory = await productCategoryService.updateCategory(modalState.editing.id, payload);
      } else {
        savedCategory = await productCategoryService.createCategory(payload);
      }

      const categoryId = savedCategory?.id || modalState.editing?.id;

      // Upload Cover File if selected
      if (categoryId && coverFile) {
        await productCategoryService.uploadCategoryImage(categoryId, coverFile);
      }

      showToast(
        modalState.editing ? 'Category updated successfully!' : 'Category created successfully!'
      );
      handleCloseModal();
      void fetchCategories();
    } catch (err: any) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productCategoryService.deleteCategory(deleteTarget.id);
      showToast('Category deleted successfully.');
      setDeleteTarget(null);
      void fetchCategories();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 500) {
        showToast(
          'Cannot delete category: It is currently linked to active products or offers in the database.'
        );
      } else {
        showToast(`Delete failed: ${getErrorMessage(err)}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Trigger Direct Image File Input
  const handleTriggerUpload = (categoryId: string) => {
    setUploadTargetId(categoryId);
    fileInputRef.current?.click();
  };

  const handleDirectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadTargetId) {
      const file = e.target.files[0];
      try {
        await productCategoryService.uploadCategoryImage(uploadTargetId, file);
        showToast('Category image uploaded successfully!');
        void fetchCategories();
      } catch (err: any) {
        showToast(`Image upload failed: ${getErrorMessage(err)}`);
      } finally {
        setUploadTargetId(null);
        e.target.value = '';
      }
    }
  };

  // Filter categories client-side as well for smooth searching
  const filtered = categories.filter((cat) => {
    const en = typeof cat.name === 'string' ? cat.name : getLocalizedCulture(cat.name, 'en');
    const ar = getLocalizedCulture(cat.name, 'ar');
    const q = searchQuery.toLowerCase();
    return en.toLowerCase().includes(q) || ar.toLowerCase().includes(q);
  });

  return (
    <div className="w-full flex flex-col gap-6 font-sans pb-16 px-4 sm:px-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-3 border border-slate-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Direct Card Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleDirectFileChange}
        className="hidden"
      />

      {/* ── Page Header & Top Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Catalog Management</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Product Categories</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              Product Categories
            </h1>
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
              {filtered.length} Categories
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Manage global product taxonomy, language localization, and cover image assets.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none',
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none',
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Table View
            </button>
          </div>

          {/* Add Category Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1F3D32] hover:bg-[#162D25] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 border-none"
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
            Add New Category
          </button>
        </div>
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium">
          Loading product categories...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700 m-0">No categories found</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-xs font-bold text-emerald-700 hover:underline border-none bg-transparent cursor-pointer"
          >
            Create first category →
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((cat) => {
            const en =
              typeof cat.name === 'string' ? cat.name : getLocalizedCulture(cat.name, 'en');
            const ar = getLocalizedCulture(cat.name, 'ar');
            const imgUrl = getImageUrl(cat.imagePath);
            const count = cat.itemCount || cat.productsCount || 0;

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Cover Container */}
                <div className="relative w-full h-36 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  {/* Items Count Badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-lg text-[11px] font-extrabold text-slate-800 shadow-xs">
                    {count} Items
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 m-0 truncate" title={en}>
                      {en || 'Untitled Category'}
                    </h3>
                    {ar && (
                      <p
                        className="text-xs font-semibold text-slate-500 m-0 mt-1 text-right font-arabic"
                        dir="rtl"
                      >
                        {ar}
                      </p>
                    )}
                  </div>

                  {/* Card Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      title="Edit Category"
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
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
                    </button>

                    <button
                      onClick={() => handleTriggerUpload(cat.id)}
                      title="Upload Cover Image"
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(cat)}
                      title="Delete Category"
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
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
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3">English Name</th>
                  <th className="px-4 py-3 text-right">Arabic Name</th>
                  <th className="px-4 py-3">Items Count</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((cat) => {
                  const en =
                    typeof cat.name === 'string' ? cat.name : getLocalizedCulture(cat.name, 'en');
                  const ar = getLocalizedCulture(cat.name, 'ar');
                  const imgUrl = getImageUrl(cat.imagePath);
                  const count = cat.itemCount || cat.productsCount || 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={en}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                            {en ? en.charAt(0).toUpperCase() : 'C'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{en}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600" dir="rtl">
                        {ar || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{count} Items</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTriggerUpload(cat.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Category Modal ── */}
      {modalState.open && (
        <Modal
          title={modalState.editing ? 'Edit Category' : 'Add New Category'}
          onClose={handleCloseModal}
          isOpen={true}
        >
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-5 pt-2">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {formError}
              </div>
            )}

            {/* Language Names Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  English Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={enName}
                  onChange={(e) => setEnName(e.target.value)}
                  placeholder="e.g. Meat & Seafood"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Arabic Name
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={arName}
                  onChange={(e) => setArName(e.target.value)}
                  placeholder="مثال: لحوم وأسماك"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white outline-none focus:border-slate-400 font-arabic text-right"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Category Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Premium cuts of beef, poultry, and fresh ocean catches."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white outline-none focus:border-slate-400"
              />
            </div>

            {/* Cover Image Upload Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Cover Image
              </label>

              {coverPreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group flex items-center justify-center">
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setCoverFile(f);
                            setCoverPreview(URL.createObjectURL(f));
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
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-red-700 border-none"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-slate-400 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="text-slate-400"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs font-bold text-slate-700">
                    Click to select cover image
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WEBP recommended</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setCoverFile(f);
                        setCoverPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1F3D32] hover:bg-[#162D25] cursor-pointer transition-all shadow-xs flex items-center gap-2 border-none',
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
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category"
          confirmLabel="Delete Category"
          message={`Are you sure you want to delete "${typeof deleteTarget.name === 'string' ? deleteTarget.name : getLocalizedCulture(deleteTarget.name, 'en')}"? Products under this category will need to be re-categorized.`}
          onConfirm={handleDeleteCategory}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
