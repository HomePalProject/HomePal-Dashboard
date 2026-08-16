import { getImageUrl } from '@/lib/formatters';
import { getErrorMessage } from '@lib/utils';
import { productCategoryService } from '@services/productCategoryService';
import type { CreateUpdateCategoryPayload, ProductCategory } from '@typeDefs/productCategoryTypes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLocalizedName } from '../utils/categoryHelpers';

export default function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [modalState, setModalState] = useState<{ open: boolean; editing?: ProductCategory }>({
    open: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenModal = (cat?: ProductCategory) => {
    setFormError(null);
    setCoverFile(null);
    if (cat) {
      const en = getLocalizedName(cat.name, 'en');
      const ar = getLocalizedName(cat.name, 'ar');
      const descEn =
        typeof cat.description === 'string'
          ? cat.description
          : getLocalizedName(cat.description ?? undefined, 'en');
      setEnName(en);
      setArName(ar);
      setDescription(descEn);
      const imgUrl = getImageUrl(cat.imagePath ?? undefined);
      setCoverPreview(imgUrl);
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

  const filtered = categories.filter((cat) => {
    const en = getLocalizedName(cat.name, 'en');
    const ar = getLocalizedName(cat.name, 'ar');
    const q = searchQuery.toLowerCase();
    return en.toLowerCase().includes(q) || ar.toLowerCase().includes(q);
  });

  const refresh = () => {
    void fetchCategories();
  };

  return {
    categories,
    loading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filtered,
    modalState,
    setModalState,
    deleteTarget,
    setDeleteTarget,
    uploading: !!uploadTargetId,
    fileInputRef,
    handleOpenModal,
    handleCloseModal,
    handleSubmitForm,
    handleDeleteCategory,
    handleTriggerUpload,
    handleDirectFileChange,
    enName,
    setEnName,
    arName,
    setArName,
    description,
    setDescription,
    coverFile,
    setCoverFile,
    coverPreview,
    setCoverPreview,
    saving,
    formError,
    toastMessage,
    showToast,
    refresh,
    deleting,
  };
}
