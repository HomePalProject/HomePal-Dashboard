import React, { useState } from 'react';
import type {
  PreferenceResponse,
  PreferenceCategoryResponse,
  AddPreferenceRequest,
} from '@typeDefs/preferencesTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';

export function PreferenceFormModal({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial?: PreferenceResponse;
  categories: PreferenceCategoryResponse[];
  onSave: (d: AddPreferenceRequest) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
    });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Preference' : 'Add Preference'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit}>
        <Field label="Name" required hint="2–100 characters">
          <input
            className="w-full px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vegan, Gluten-Free, Nut Allergy"
            minLength={2}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Category" required>
          <select
            className="w-full px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border appearance-none"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" hint="Optional — max 300 characters">
          <textarea
            className="w-full px-12 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-surface outline-none box-border resize-y min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe this preference (e.g., No dairy products)..."
            maxLength={300}
          />
        </Field>
        {error && <p className="text-status-error text-13 mb-12">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Preference'}
        />
      </form>
    </Modal>
  );
}
