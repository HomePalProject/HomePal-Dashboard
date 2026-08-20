export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  if (s.includes('fail') || s.includes('action') || s.includes('error')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-2xl text-[11px] font-semibold tracking-tight bg-status-error-container text-status-error border border-status-error/20">
        {status}
      </span>
    );
  }

  if (s.includes('progress') || s.includes('pending') || s.includes('review')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-2xl text-[11px] font-semibold tracking-tight bg-status-warning-container text-status-warning border border-status-warning/20">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-2xl text-[11px] font-semibold tracking-tight bg-status-success-container text-status-success border border-status-success/20">
      {status}
    </span>
  );
}
