import { Field } from '@components/ui/Field';
import { Modal } from '@components/ui/Modal';
import { ModalActions } from '@components/ui/ModalActions';
import { cn } from '@lib/utils';
import type { CreateAdminRequest } from '@typeDefs/adminTypes';
import { useState } from 'react';
import { useGovernorates, useCitiesByGovernorate } from '@hooks/useLocations';

interface AdminFormModalProps {
  onSave: (data: CreateAdminRequest) => Promise<string | null>;
  onClose: () => void;
}

export function AdminFormModal({ onSave, onClose }: AdminFormModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silently fetch default locations since backend requires them
  const { governorates } = useGovernorates();
  const defaultGovId = governorates?.[0]?.id || '';
  const { cities } = useCitiesByGovernorate(defaultGovId);
  const defaultCityId = cities?.[0]?.id || '';

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1800);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CreateAdminRequest = {
      username,
      fullName: `Admin ${username}`,
      email,
      password,
      confirmPassword: password,
      gender: 1,
      birthDate: '1990-01-01',
      governorateId: defaultGovId,
      cityId: defaultCityId,
    };
    const err = await onSave(payload);
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title="Create New Admin Account" onClose={onClose} isOpen={true} maxWidth="max-w-md">
      <div className="flex items-center gap-2.5 mb-4 -mt-1 pb-3 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold text-text-primary">Admin Credentials</div>
          <p className="text-[11px] text-text-secondary m-0">
            Set login details for the new system admin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
        <Field label="Admin Username" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-disabled">
              @
            </span>
            <input
              type="text"
              placeholder="e.g. admin_ops"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border text-xs outline-none bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs"
              required
              autoComplete="new-username"
            />
          </div>
        </Field>

        <Field label="Email Address" required>
          <input
            type="email"
            placeholder="e.g. admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-border text-xs outline-none bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs"
            required
            autoComplete="new-email"
          />
        </Field>

        <Field label="Initial Password" required>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 pr-8 rounded-lg border border-border text-xs outline-none bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono shadow-2xs"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary p-1 cursor-pointer"
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? (
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={generatePassword}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border bg-surface-variant/40',
                  'text-text-primary hover:bg-border/60 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-2xs'
                )}
              >
                <span>Auto</span>
              </button>
            </div>

            {password && (
              <div className="flex items-center justify-between text-[11px] px-2.5 py-1 bg-surface-variant/30 rounded-md border border-border/60">
                <span className="font-mono text-text-secondary truncate">{password}</span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer shrink-0 ml-2"
                >
                  {copiedPass ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </Field>

        {error && (
          <div className="flex items-center gap-2 text-status-error text-xs font-semibold p-2 bg-status-error-container rounded-lg border border-status-error/20">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2">
          <ModalActions onCancel={onClose} saving={saving} label="Create Admin" />
        </div>
      </form>
    </Modal>
  );
}
