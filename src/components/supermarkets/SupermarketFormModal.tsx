import React, { useState } from 'react';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';
import { getLocalString, toLocalized } from '@lib/formatters';

export function SupermarketFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Supermarket;
  onSave: (d: any) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial ? getLocalString(initial.name) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({ name: toLocalized(name) });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Supermarket' : 'Add Supermarket'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit}>
        <Field label="Supermarket Name" required>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spinneys"
            required
          />
        </Field>
        {error && <p className="text-status-error text-13 mb-12 m-0">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Supermarket'}
        />
      </form>
    </Modal>
  );
}
