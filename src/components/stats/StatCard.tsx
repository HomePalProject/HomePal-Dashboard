import React from 'react';
import { cn } from '@lib/utils';
import { useTranslation } from 'react-i18next';

export function StatCard({
  title,
  value,
  change,
  subtext,
  isCurrency = false,
  isPercent = false,
  icon,
  iconClassName,
  onClick,
}: {
  title: string;
  value: number | string;
  change?: number;
  subtext?: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  icon: React.ReactNode;
  iconClassName?: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation('stats');

  // Format values
  let displayValue = value;
  if (typeof value === 'number') {
    displayValue = isCurrency
      ? t('currencyFormat', { value: (value / 1000).toFixed(1) })
      : isPercent
        ? `${value.toFixed(1)}%`
        : value.toLocaleString();
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-surface rounded-2xl border border-border/60 p-5 lg:p-6 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs rtl:text-base font-black text-text-secondary tracking-[0.2em] uppercase">
          {title}
        </span>
        <div className={cn('text-primary transition-colors', iconClassName)}>{icon}</div>
      </div>

      <div className="text-3xl font-black text-text-primary tracking-tighter">{displayValue}</div>

      {(change !== undefined || subtext) && (
        <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
          {change !== undefined && (
            <span
              className={cn(
                'flex items-center gap-0.5 font-bold',
                change >= 0 ? 'text-primary' : 'text-status-error'
              )}
            >
              {change >= 0 ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(change)}%
            </span>
          )}
          <span className="text-text-disabled">
            {subtext || (change !== undefined && t('vsLastMonth'))}
          </span>
        </div>
      )}
    </div>
  );
}
