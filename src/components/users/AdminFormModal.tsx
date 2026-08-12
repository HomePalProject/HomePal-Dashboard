import { Field } from '@components/ui/Field';
import { Modal } from '@components/ui/Modal';
import { ModalActions } from '@components/ui/ModalActions';
import { cn } from '@lib/utils';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';
import React, { useState } from 'react';

interface AdminFormModalProps {
  onSave: (data: CreateAdminRequest) => Promise<string | null>;
  onClose: () => void;
}

export function AdminFormModal({ onSave, onClose }: AdminFormModalProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Admin');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in username and password.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CreateAdminRequest = {
      username,
      fullName: `Admin ${username}`,
      email: `${username}@homepal.system`,
      password,
      confirmPassword: password,
      gender: 1,
      birthDate: '1990-01-01',
      governorate: 'Central',
      city: 'Metropolis',
    };
    const err = await onSave(payload);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title="Create New Admin Account" onClose={onClose} isOpen={true} maxWidth="max-w-lg">
      <p className="text-sm text-text-secondary mb-20 -mt-4">
        Assign credentials and role level for the new administrator.
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Admin Username" required>
          <input
            type="text"
            placeholder="e.g. admin_ops"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-12 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
            required
          />
        </Field>

        <Field label="Assign Role" required>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-12 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border appearance-none cursor-pointer"
          >
            <option value="Admin">Admin</option>
          </select>
        </Field>

        <Field label="Initial Password" required>
          <div className="flex gap-8">
            <input
              type="text"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-12 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border"
              required
            />
            <button
              type="button"
              onClick={generatePassword}
              className={cn(
                'px-12 py-2.5 rounded-lg text-xs font-semibold border border-border bg-surface-variant',
                'text-text-secondary hover:bg-border transition-colors cursor-pointer whitespace-nowrap'
              )}
            >
              🎲 Generate
            </button>
          </div>
        </Field>

        {error && (
          <p className="text-status-error text-13 mb-12 px-12 py-8 bg-status-error-container rounded-lg">
            {error}
          </p>
        )}

        <ModalActions onCancel={onClose} saving={saving} label="Create Admin" />
      </form>
    </Modal>
  );
}
