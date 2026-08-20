import React, { useState, useEffect } from 'react';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { cn } from '@lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: string;
  note?: string;
  dark?: boolean;
  delay?: number;
}

export function MetricCard({
  icon,
  value,
  label,
  badge,
  note,
  dark = false,
  delay = 0,
}: MetricCardProps) {
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Card
      className={cn(
        'h-full flex flex-col justify-between transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]',
        vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-40',
        dark ? 'bg-primary border-none shadow-none text-white' : 'bg-surface'
      )}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            'w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0',
            dark ? 'bg-white/15 text-white' : 'bg-surface-variant text-primary'
          )}
        >
          {icon}
        </div>
        {badge && (
          <Badge
            variant={dark ? 'outline' : 'primary'}
            className={dark ? 'border-none bg-white/15 text-white' : ''}
          >
            {badge}
          </Badge>
        )}
      </div>

      <div className="mt-6">
        <div
          className={`text-5xl font-extrabold leading-none tracking-tight ${dark ? 'text-white' : 'text-text-primary'}`}
        >
          {value}
        </div>
        <div
          className={`text-sm font-bold tracking-[0.08em] uppercase mt-2 ${dark ? 'text-white/65' : 'text-text-disabled'}`}
        >
          {label}
        </div>
        {note && (
          <div
            className={`text-xs italic mt-6 leading-[1.4] ${dark ? 'text-white/40' : 'text-text-disabled/70'}`}
          >
            {note}
          </div>
        )}
      </div>
    </Card>
  );
}
