import { getImageUrl } from '@/lib/formatters';
import { getErrorMessage } from '@lib/utils';
import { fetchBilingual } from '@lib/localization';
import { productCategoryService } from '@services/productCategoryService';
import type { CreateUpdateCategoryPayload, ProductCategory } from '@typeDefs/productCategoryTypes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '../utils/categoryHelpers';

export default function useProductCategories() {
  const { t } = useTranslation('categories');
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
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const q = searchQuery.trim();
      const [enList, arList] = await Promise.all([
        (q
          ? productCategoryService.searchCategories(q, 'en')
          : productCategoryService.getCategories('en')
        ).catch(() => []),
        (q
          ? productCategoryService.searchCategories(q, 'ar')
          : productCategoryService.getCategories('ar')
        ).catch(() => []),
      ]);
      const arById = new Map(arList.map((c) => [c.id, c]));
      const merged = enList.map((enCat) => {
        const arCat = arById.get(enCat.id);
        return {
          ...enCat,
          name: [
            {
              culture: 'en',
              languageCode: 'en',
              value:
                typeof enCat.name === 'string' ? enCat.name : getLocalizedName(enCat.name, 'en'),
            },
            {
              culture: 'ar',
              languageCode: 'ar',
              value: arCat
                ? typeof arCat.name === 'string'
                  ? arCat.name
                  : getLocalizedName(arCat.name, 'ar')
                : '',
            },
          ],
          description: [
            {
              culture: 'en',
              languageCode: 'en',
              value:
                typeof enCat.description === 'string'
                  ? enCat.description
                  : getLocalizedName(enCat.description ?? undefined, 'en'),
            },
            {
              culture: 'ar',
              languageCode: 'ar',
              value: arCat
                ? typeof arCat.description === 'string'
                  ? arCat.description
                  : getLocalizedName(arCat.description ?? undefined, 'ar')
                : '',
            },
          ],
        };
      });
      setCategories(merged);
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

  const handleOpenModal = async (cat?: ProductCategory) => {
    setFormError(null);
    setCoverFile(null);
    if (cat) {
      let resolvedCat = cat;
      setLoadingEditId(cat.id);
      try {
        const { en, ar } = await fetchBilingual((lang) =>
          productCategoryService.getCategoryById(cat.id, lang)
        );

        const enNameVal = typeof en.name === 'string' ? en.name : getLocalizedName(en.name, 'en');
        const arNameVal = typeof ar.name === 'string' ? ar.name : getLocalizedName(ar.name, 'ar');
        const enDescVal =
          typeof en.description === 'string'
            ? en.description
            : getLocalizedName(en.description ?? undefined, 'en');
        const arDescVal =
          typeof ar.description === 'string'
            ? ar.description
            : getLocalizedName(ar.description ?? undefined, 'ar');

        resolvedCat = {
          ...cat,
          name: [
            { culture: 'en-US', languageCode: 'en-US', value: enNameVal },
            { culture: 'ar-EG', languageCode: 'ar-EG', value: arNameVal },
          ],
          description: [
            { culture: 'en-US', languageCode: 'en-US', value: enDescVal },
            { culture: 'ar-EG', languageCode: 'ar-EG', value: arDescVal },
          ],
        };
      } catch {
        showToast(t('toastLoadBilingualError'));
      } finally {
        setLoadingEditId(null);
      }

      const en =
        getLocalizedName(resolvedCat.name, 'en') ||
        (typeof resolvedCat.name === 'string' ? resolvedCat.name : '');
      const ar = getLocalizedName(resolvedCat.name, 'ar');
      const descEn =
        getLocalizedName(resolvedCat.description ?? undefined, 'en') ||
        (typeof resolvedCat.description === 'string' ? resolvedCat.description : '');
      setEnName(en);
      setArName(ar);
      setDescription(descEn);
      const imgUrl = getImageUrl(cat.imagePath ?? undefined);
      setCoverPreview(imgUrl);
      setModalState({ open: true, editing: resolvedCat });
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

  const handleSubmitForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!enName.trim()) {
      setFormError(t('errEnNameRequired'));
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload: CreateUpdateCategoryPayload = {
      name: [
        { culture: 'en-US', languageCode: 'en-US', value: enName.trim() },
        { culture: 'ar', languageCode: 'ar', value: arName.trim() || enName.trim() },
      ],
      description: [
        { culture: 'en-US', languageCode: 'en-US', value: description.trim() },
        { culture: 'ar', languageCode: 'ar', value: description.trim() },
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
      showToast(modalState.editing ? t('toastCategoryUpdated') : t('toastCategoryCreated'));
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
      showToast(t('toastCategoryDeleted'));
      setDeleteTarget(null);
      void fetchCategories();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 500) {
        showToast(t('errDeleteLinked'));
      } else {
        showToast(t('errDeleteFailed', { error: getErrorMessage(err) }));
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
        showToast(t('toastImageUploaded'));
        void fetchCategories();
      } catch (err: any) {
        showToast(t('errImageUploadFailed', { error: getErrorMessage(err) }));
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
    loadingEditId,
  };
}
