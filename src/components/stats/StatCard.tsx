import React from 'react';
import { cn } from '@lib/utils';
import { useTranslation } from 'react-i18next';

export function StatCard({
  title,
  value,
  change,
  isCurrency = false,
  isPercent = false,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  change: number;
  isCurrency?: boolean;
  isPercent?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const { t } = useTranslation('stats');

  // Format values
  const displayValue = isCurrency
    ? t('currencyFormat', { value: (value / 1000).toFixed(1) })
    : isPercent
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-xl border border-border p-6 flex flex-col gap-1',
        onClick && 'cursor-pointer transition-all duration-200 hover:shadow-lg'
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-text-secondary tracking-widest uppercase">
          {title}
        </span>
        <div className="text-primary">{icon}</div>
      </div>

      <div className="text-typography-display text-text-primary">{displayValue}</div>

      <div className="flex items-center gap-1.5 text-xs">
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
        <span className="text-text-secondary">{t('vsLastMonth')}</span>
      </div>
    </div>
  );
}
