import React, { useState } from 'react';
import type { PreferenceCategoryResponse, CreateCategoryRequest } from '@typeDefs/preferencesTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';
import { getLocalizedCulture } from '@lib/formatters';

export function CategoryFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: PreferenceCategoryResponse;
  onSave: (d: CreateCategoryRequest) => Promise<string | null>;
  onClose: () => void;
}) {
  const [nameEn, setNameEn] = useState(
    initial
      ? getLocalizedCulture(initial.name, 'en') ||
          (typeof initial.name === 'string' ? initial.name : '')
      : ''
  );
  const [nameAr, setNameAr] = useState(initial ? getLocalizedCulture(initial.name, 'ar') : '');
  const [descriptionEn, setDescriptionEn] = useState(
    initial
      ? getLocalizedCulture(initial.description, 'en') ||
          (typeof initial.description === 'string' ? initial.description : '')
      : ''
  );
  const [descriptionAr, setDescriptionAr] = useState(
    initial ? getLocalizedCulture(initial.description, 'ar') : ''
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({
      name: [
        { culture: 'en', value: nameEn.trim() || nameAr.trim() },
        { culture: 'ar', value: nameAr.trim() || nameEn.trim() },
      ],
      description:
        descriptionEn.trim() || descriptionAr.trim()
          ? [
              { culture: 'en', value: descriptionEn.trim() || descriptionAr.trim() },
              { culture: 'ar', value: descriptionAr.trim() || descriptionEn.trim() },
            ]
          : undefined,
    });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Category' : 'Add Category'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="English Name" required hint="2–100 characters">
            <input
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none box-border"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Dietary Restrictions"
              minLength={2}
              maxLength={100}
              required={!nameAr}
            />
          </Field>
          <Field label="Arabic Name" hint="Optional if English is provided">
            <input
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none box-border text-right"
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: القيود الغذائية"
              minLength={2}
              maxLength={100}
              required={!nameEn}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="English Description" hint="Optional — max 300 characters">
            <textarea
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none box-border resize-y min-h-[80px]"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Describe what this category covers..."
              maxLength={300}
            />
          </Field>
          <Field label="Arabic Description" hint="Optional — max 300 characters">
            <textarea
              className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none box-border resize-y min-h-[80px] text-right"
              dir="rtl"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف هذا التصنيف..."
              maxLength={300}
            />
          </Field>
        </div>

        {error && <p className="text-red-600 text-[13px] font-medium m-0">{error}</p>}
        <div className="mt-2">
          <ModalActions
            onCancel={onClose}
            saving={saving}
            label={initial ? 'Save Changes' : 'Add Category'}
          />
        </div>
      </form>
    </Modal>
  );
}
