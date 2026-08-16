import { cn } from '@lib/utils';

interface HeaderProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAdd: () => void;
}

export default function Header({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onAdd,
}: HeaderProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search Input */}
      <div className="relative w-full sm:w-auto sm:min-w-220">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-400"
        />
      </div>

      {/* View Switcher */}
      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setViewMode('grid')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none',
            viewMode === 'grid'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'bg-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Grid View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none',
            viewMode === 'table'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'bg-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Table View
        </button>
      </div>

      {/* Add Category */}
      <button
        onClick={onAdd}
        className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 py-2.5 bg-[#1F3D32] hover:bg-[#162D25] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 border-none"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add New Category
      </button>
    </div>
  );
}
