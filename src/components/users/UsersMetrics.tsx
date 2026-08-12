import { cn } from '@lib/utils';

interface UsersMetricsProps {
  totalCount: number;
  totalActive: number;
  totalSuspended: number;
  globalTotalAdmins: number;
}

export function UsersMetrics({
  totalCount,
  totalActive,
  totalSuspended,
  globalTotalAdmins,
}: UsersMetricsProps) {
  const metrics = [
    { label: 'Total Users', value: totalCount, color: 'text-text-primary' },
    { label: 'Active (Page)', value: totalActive, color: 'text-status-success' },
    { label: 'Suspended (Page)', value: totalSuspended, color: 'text-status-error' },
    {
      label: 'System Admins',
      value: globalTotalAdmins,
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-16">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white rounded-xl border border-border p-20 flex flex-col gap-4"
        >
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
            {m.label}
          </span>
          <span className={cn('text-3xl font-extrabold', m.color)}>{m.value}</span>
        </div>
      ))}
    </div>
  );
}
