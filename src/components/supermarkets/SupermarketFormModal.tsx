import React, { useState } from 'react';
import type { Supermarket } from '@typeDefs/catalogTypes';
import { Modal } from '@components/ui/Modal';
import { Field } from '@components/ui/Field';
import { ModalActions } from '@components/ui/ModalActions';
import { getLocalizedCulture } from '@lib/formatters';

export function SupermarketFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Supermarket;
  onSave: (d: any) => Promise<string | null>;
  onClose: () => void;
}) {
  const [nameEn, setNameEn] = useState(
    initial
      ? getLocalizedCulture(initial.name, 'en') ||
          (typeof initial.name === 'string' ? initial.name : '')
      : ''
  );
  const [nameAr, setNameAr] = useState(initial ? getLocalizedCulture(initial.name, 'ar') : '');
  const [address, setAddress] = useState(initial?.address || '');
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial?.logoPath || null);
  const [deleteLogo, setDeleteLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setDeleteLogo(false);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setDeleteLogo(true);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSave({
      name: [
        { culture: 'en-US', languageCode: 'en-US', value: nameEn.trim() || nameAr.trim() },
        { culture: 'ar-EG', languageCode: 'ar-EG', value: nameAr.trim() || nameEn.trim() },
      ],
      address: address.trim() || null,
      websiteUrl: websiteUrl.trim() || null,
      logoFile,
      deleteLogo,
    });
    setSaving(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={initial ? 'Edit Supermarket' : 'Add Supermarket'} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Logo Upload / Preview Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Supermarket Logo</label>
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            {logoPreview ? (
              <div className="relative group">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 p-1"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white border border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center text-xs font-bold shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}

            <div className="flex flex-col gap-1 flex-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer w-fit shadow-xs">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {logoPreview ? 'Change Logo' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[11px] font-semibold text-red-600 hover:underline w-fit border-none bg-transparent cursor-pointer p-0"
                >
                  Remove Logo
                </button>
              )}

              <span className="text-[11px] text-slate-400">PNG, JPG or WEBP (max. 5MB)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="English Name" required>
            <input
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white text-slate-900 focus:border-slate-400 box-border"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Spinneys Egypt"
              required={!nameAr}
            />
          </Field>
          <Field label="Arabic Name">
            <input
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white text-slate-900 focus:border-slate-400 box-border text-right"
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: سبينيس مصر"
              required={!nameEn}
            />
          </Field>
        </div>

        <Field label="Facebook Page / Scraper URL">
          <input
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white text-slate-900 focus:border-slate-400 box-border"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://facebook.com/SpinneysEgypt"
            type="url"
          />
        </Field>

        <Field label="Address / Region">
          <input
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none bg-white text-slate-900 focus:border-slate-400 box-border"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Cairo, Egypt"
          />
        </Field>

        {error && <p className="text-xs font-semibold text-red-600 m-0">{error}</p>}

        <ModalActions
          onCancel={onClose}
          saving={saving}
          label={initial ? 'Save Changes' : 'Add Supermarket'}
        />
      </form>
    </Modal>
  );
}
