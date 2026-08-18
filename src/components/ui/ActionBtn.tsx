import { Button } from './Button';

export function ActionBtn({
  icon,
  onClick,
  danger,
  title,
  loading,
}: {
  icon: 'edit' | 'delete';
  onClick: () => void;
  danger?: boolean;
  title?: string;
  loading?: boolean;
}) {
  return (
    <Button
      title={title}
      onClick={onClick}
      disabled={loading}
      variant={danger ? 'danger' : 'outline'}
      size="icon"
      className={
        danger
          ? 'bg-transparent text-status-error border-status-error/20 hover:bg-status-error-container hover:text-status-error'
          : 'bg-white text-text-secondary'
      }
    >
      {loading ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-9-9" />
        </svg>
      ) : icon === 'edit' ? (
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
    </Button>
  );
}
