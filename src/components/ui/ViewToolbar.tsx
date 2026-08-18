import type { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@lib/utils';

export interface ViewToolbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;

  metaContent?: ReactNode;
  primaryAction?: ReactNode;
}

export function ViewToolbar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  viewMode,
  onViewModeChange,
  metaContent,
  primaryAction,
}: ViewToolbarProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shadow-xs">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-variant/50 border border-transparent rounded-xl text-[13px] text-text-primary outline-none focus:border-border focus:bg-white transition-all placeholder:text-text-disabled font-medium"
            />
          </div>
        )}

        {metaContent && <div className="shrink-0 hidden sm:block">{metaContent}</div>}
      </div>

      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
        {metaContent && <div className="shrink-0 sm:hidden">{metaContent}</div>}

        <div className="flex items-center gap-3">
          {viewMode && onViewModeChange && (
            <div className="flex items-center p-1 bg-surface-variant border border-border rounded-xl shrink-0">
              <Button
                onClick={() => onViewModeChange('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 min-h-0 h-auto',
                  viewMode === 'grid'
                    ? 'bg-white text-text-primary shadow-sm hover:bg-white/90'
                    : 'text-text-secondary hover:text-text-primary bg-transparent hover:bg-transparent'
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
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                onClick={() => onViewModeChange('table')}
                variant={viewMode === 'table' ? 'primary' : 'ghost'}
                size="sm"
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 min-h-0 h-auto',
                  viewMode === 'table'
                    ? 'bg-white text-text-primary shadow-sm hover:bg-white/90'
                    : 'text-text-secondary hover:text-text-primary bg-transparent hover:bg-transparent'
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
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          )}

          {primaryAction && <div className="shrink-0">{primaryAction}</div>}
        </div>
      </div>
    </div>
  );
}
