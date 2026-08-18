import React, { forwardRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
  rightElement?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, fullWidth = false, className = '', id, rightElement, ...props }, ref) => {
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthClass} ${className}`}>
        <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`min-h-11 px-4 py-3 rounded-2xl border text-base bg-surface text-text-primary transition-colors focus:outline-none focus:ring-2 w-full ${
              rightElement ? 'pr-10' : ''
            } ${
              error
                ? 'border-status-error focus:ring-status-error focus:border-status-error'
                : 'border-border focus:border-primary focus:ring-primary/20 hover:border-text-secondary'
            }`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</div>
          )}
        </div>
        {error && <span className="text-xs text-status-error font-medium">{error}</span>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
