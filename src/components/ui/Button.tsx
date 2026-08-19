import React from 'react';
import { cn } from '@lib/utils';
import { useTranslation } from 'react-i18next';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const { t } = useTranslation('common');

  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-active focus-visible:ring-primary shadow-sm',
    secondary: 'bg-surface-variant text-text-primary hover:bg-border focus-visible:ring-border',
    danger: 'bg-status-error text-white hover:opacity-90 focus-visible:ring-status-error shadow-sm',
    ghost: 'bg-transparent text-text-primary hover:bg-surface-variant focus-visible:ring-border',
    outline:
      'border-2 border-border bg-transparent text-text-primary hover:bg-surface-variant focus-visible:ring-border',
  };

  const sizeClasses = {
    sm: 'min-h-[32px] px-3 py-1.5 text-xs rounded-xl',
    md: 'min-h-[40px] px-4 py-2 text-sm rounded-xl',
    lg: 'min-h-[48px] px-6 py-2.5 text-base rounded-2xl',
    icon: 'h-9 w-9 p-0 rounded-xl flex items-center justify-center shrink-0',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        disabledClass,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {t('loading')}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
