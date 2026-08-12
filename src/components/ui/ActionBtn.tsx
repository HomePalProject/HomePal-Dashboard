import { cn } from '@lib/utils';

export function ActionBtn({
  icon,
  onClick,
  danger,
  title,
}: {
  icon: 'edit' | 'delete';
  onClick: () => void;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-variant',
        danger ? 'text-status-error' : 'text-text-secondary'
      )}
    >
      {icon === 'edit' ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
    </button>
  );
}
