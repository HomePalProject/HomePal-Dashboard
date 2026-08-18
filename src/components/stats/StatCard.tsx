import React from 'react';
import { cn } from '@lib/utils';

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
  const isPositive = change > 0;

  // Format values
  const displayValue = isCurrency
    ? `$${(value / 1000).toFixed(1)}k`
    : isPercent
      ? `${value}%`
      : value.toLocaleString();

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-xl border border-border p-6 flex flex-col gap-1',
        onClick &&
          'cursor-pointer transition-all duration-200 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]'
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-text-secondary tracking-widest uppercase">
          {title}
        </span>
        <div className="text-primary">{icon}</div>
      </div>

      <div className="text-[32px] font-extrabold text-text-primary">{displayValue}</div>

      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={cn(
            'flex items-center gap-0.5 font-bold',
            isPositive ? 'text-primary' : 'text-status-error'
          )}
        >
          {isPositive ? (
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
        <span className="text-text-secondary">vs last month</span>
      </div>
    </div>
  );
}
