import React from 'react';
import { cn } from '@lib/utils';

export function StatCard({
  title,
  value,
  subValue,
  highlight = false,
}: {
  title: string;
  value: string | number;
  subValue: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden',
        highlight ? 'border-status-error shadow-[0_4px_12px_rgba(217,83,79,0.08)]' : 'border-border'
      )}
    >
      {highlight && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-status-error" />}

      <div className="flex items-center gap-[8px]">
        <div
          className={cn(
            'w-8 h-8 rounded-3xl flex items-center justify-center',
            highlight
              ? 'bg-status-error-container text-status-error'
              : 'bg-surface text-text-secondary'
          )}
        >
          {highlight ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          )}
        </div>
        <span className="text-[13px] font-semibold text-text-secondary">{title}</span>
      </div>

      <div
        className={cn('text-2xl font-bold', highlight ? 'text-status-error' : 'text-text-primary')}
      >
        {value}
      </div>

      <div
        className={cn(
          'text-xs font-medium w-fit rounded',
          highlight
            ? 'text-status-error bg-transparent p-0'
            : 'text-text-secondary bg-surface px-[8px] py-[4px]'
        )}
      >
        {subValue}
      </div>
    </div>
  );
}
