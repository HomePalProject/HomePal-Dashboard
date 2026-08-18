import React from 'react';
import { cn } from '@lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'primary', className, ...props }: BadgeProps) {
  const baseClasses =
    'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em]';

  const variants = {
    success: 'bg-status-success-container text-status-success',
    warning: 'bg-status-warning-container text-status-warning',
    error: 'bg-status-error-container text-status-error',
    info: 'bg-status-info-container text-status-info',
    primary: 'bg-primary-container text-primary',
    outline: 'border border-border text-text-secondary bg-surface',
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
