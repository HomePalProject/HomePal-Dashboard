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
  const activeRate = totalCount > 0 ? Math.round((totalActive / totalCount) * 100) : 100;
  const suspendedRate = totalCount > 0 ? Math.round((totalSuspended / totalCount) * 100) : 0;

  const metrics = [
    {
      id: 'total',
      label: 'Total Accounts',
      value: totalCount,
      subtext: 'Filtered',
      color: 'text-text-primary',
      bgIcon: 'bg-primary/10 text-primary',
      badgeBg: 'bg-primary/10 text-primary',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'active',
      label: 'Active Users',
      value: totalActive,
      subtext: `${activeRate}% active`,
      color: 'text-status-success',
      bgIcon: 'bg-status-success/10 text-status-success',
      badgeBg: 'bg-status-success/10 text-status-success',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: 'suspended',
      label: 'Suspended Users',
      value: totalSuspended,
      subtext: `${suspendedRate}% suspended`,
      color: 'text-status-error',
      bgIcon: 'bg-status-error/10 text-status-error',
      badgeBg: 'bg-status-error/10 text-status-error',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      id: 'admins',
      label: 'System Admins',
      value: globalTotalAdmins,
      subtext: 'Root access',
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="bg-surface rounded-xl border border-border/80 p-3.5 flex flex-col justify-between gap-2 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider truncate">
              {m.label}
            </span>
            <div className={cn('p-1.5 rounded-lg shrink-0', m.bgIcon)}>{m.icon}</div>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-1">
            <span className={cn('text-2xl font-extrabold tracking-tight', m.color)}>
              {m.value.toLocaleString()}
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full border border-current/10 whitespace-nowrap',
                m.badgeBg
              )}
            >
              {m.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
