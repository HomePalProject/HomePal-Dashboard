import { Field } from '@components/ui/Field';
import { Modal } from '@components/ui/Modal';
import { ModalActions } from '@components/ui/ModalActions';
import { cn } from '@lib/utils';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';
import { useState, useEffect } from 'react';
import { useGovernorates, useCitiesByGovernorate } from '@hooks/useLocations';

interface AdminFormModalProps {
  onSave: (data: CreateAdminRequest) => Promise<string | null>;
  onClose: () => void;
}

export function AdminFormModal({ onSave, onClose }: AdminFormModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [governorateId, setGovernorateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { governorates, loading: govLoading } = useGovernorates();
  const { cities, loading: citiesLoading } = useCitiesByGovernorate(governorateId);

  useEffect(() => {
    setCityId('');
  }, [governorateId]);

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
    if (!username || !password || !governorateId || !cityId) {
      setError('Please fill in all required fields.');
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
      governorateId,
      cityId,
    };
    const err = await onSave(payload);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title="Create New Admin Account" onClose={onClose} isOpen={true} maxWidth="max-w-lg">
      <p className="text-sm text-text-secondary mb-20 -mt-4">
        Assign credentials for the new administrator.
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

        <div className="flex gap-4">
          <div className="flex-1">
            <Field label="Governorate" required>
              <select
                value={governorateId}
                onChange={(e) => setGovernorateId(e.target.value)}
                disabled={govLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border cursor-pointer disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Select Governorate
                </option>
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex-1">
            <Field label="City" required>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!governorateId || citiesLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-sm outline-none bg-surface text-text-primary focus:border-primary box-border cursor-pointer disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Select City
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

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
