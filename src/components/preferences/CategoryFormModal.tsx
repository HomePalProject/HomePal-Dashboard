import React, { useState } from 'react';
import type { PreferenceCategoryResponse, CreateCategoryRequest } from '@typeDefs/preferencesTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';

export function CategoryFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: PreferenceCategoryResponse;
  onSave: (d: CreateCategoryRequest) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({ name: name.trim(), description: description.trim() || undefined });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Category' : 'Add Category'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit}>
        <Field label="Name" required hint="2–100 characters">
          <input
            className="w-full px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dietary Restrictions"
            minLength={2}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Description" hint="Optional — max 300 characters">
          <textarea
            className="w-full px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border resize-y min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this category covers (e.g., Food allergies and diets)..."
            maxLength={300}
          />
        </Field>
        {error && <p className="text-status-error text-13 mb-12">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Category'}
        />
      </form>
    </Modal>
  );
}
