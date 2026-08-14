export function MockDashboardCard() {
  return (
    <div className="mt-40 bg-surface rounded-xl shadow-xl p-20 border border-border/10 w-full text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-[8px]">
          <div className="w-24 h-24 rounded-md bg-primary-container animate-pulse"></div>
          <div className="h-3.5 w-24 rounded bg-surface-variant animate-pulse"></div>
        </div>
        <div className="h-12 w-56 rounded bg-surface-variant animate-pulse"></div>
      </div>

      {[
        { label: 'Active Households', width: 'w-20' },
        { label: 'Members', width: 'w-12' },
        { label: 'Pantry Items', width: 'w-32' },
        { label: 'Shopping Lists', width: 'w-25' },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between py-2.5 border-t border-border/30 first:border-t-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-[8px] h-[8px] rounded-full bg-primary-container"></div>
            <div className="h-12 w-28 rounded bg-surface-variant animate-pulse"></div>
          </div>
          <div className={`h-12 ${row.width} rounded bg-primary-container/60 animate-pulse`}></div>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-border/20 flex gap-[8px]">
        <div className="h-2.5 w-full rounded-full bg-primary-container/40 animate-pulse"></div>
        <div className="h-2.5 w-1/2 rounded-full bg-surface-variant animate-pulse"></div>
      </div>
    </div>
  );
}
