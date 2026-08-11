import React from 'react';

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-20">
      <label className="block text-13 font-semibold text-text-primary mb-1.5">
        {label} {required && <span className="text-status-error">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-secondary mt-[4px] mb-0">{hint}</p>}
    </div>
  );
}
