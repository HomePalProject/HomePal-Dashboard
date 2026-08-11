import React, { useState } from 'react';
import type { Supermarket, Offer } from '@typeDefs/catalogTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';
import { getLocalString, toLocalized } from '@lib/formatters';

export function OfferFormModal({
  initial,
  supermarkets,
  onSave,
  onClose,
}: {
  initial?: Offer;
  supermarkets: Supermarket[];
  onSave: (d: any) => Promise<string | null>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial ? getLocalString(initial.title) : '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [supermarketId, setSupermarketId] = useState(initial?.supermarketId || '');
  const [categoryId] = useState(initial?.categoryId || '');
  const [status, setStatus] = useState(initial?.status || 'Success');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: any = {
      title: toLocalized(title),
      supermarketId: supermarketId || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
    };
    if (price && !isNaN(Number(price))) {
      payload.price = Number(price);
    }
    const err = await onSave(payload);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Offer' : 'Add Offer (Manual)'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit}>
        <Field label="Offer Title" required>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Organic Gala Apples 1kg"
            required
          />
        </Field>
        <Field label="Supermarket">
          <select
            className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary appearance-none box-border"
            value={supermarketId}
            onChange={(e) => setSupermarketId(e.target.value)}
          >
            <option value="">Select a supermarket...</option>
            {supermarkets.map((m) => (
              <option key={m.id} value={m.id}>
                {getLocalString(m.name)}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-4">
          <div className="flex-1">
            <Field label="Price (AED)">
              <input
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 12.50"
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Status">
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary appearance-none box-border"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Success">Success</option>
                <option value="In Progress">In Progress</option>
                <option value="Action Required">Action Required</option>
              </select>
            </Field>
          </div>
        </div>
        {error && <p className="text-status-error text-13 mb-12 m-0">{error}</p>}
        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Offer'}
        />
      </form>
    </Modal>
  );
}
