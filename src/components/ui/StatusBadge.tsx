export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  if (s.includes('fail') || s.includes('action') || s.includes('error')) {
    return (
      <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-2xl text-[11px] font-semibold tracking-[0.02em] bg-red-50 text-red-700 border border-red-700/20">
        {status}
      </span>
    );
  }

  if (s.includes('progress') || s.includes('pending') || s.includes('review')) {
    return (
      <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-2xl text-[11px] font-semibold tracking-[0.02em] bg-amber-50 text-amber-700 border border-amber-700/20">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-2xl text-[11px] font-semibold tracking-[0.02em] bg-green-50 text-green-700 border border-green-700/20">
      {status}
    </span>
  );
}
