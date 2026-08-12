import { cn } from '@lib/utils';
import { ActionBtn } from '@components/ui/ActionBtn';
import { ROLE_OPTIONS, getRoleBadgeClass, getInitials } from '@/utils/userUtils';
import type { AdminUser } from '@typeDefs/adminTypes';

interface UsersTableProps {
  loading: boolean;
  filtered: AdminUser[];
  search: string;
  setSearch: (s: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalCount: number;
  setDeleteTarget: (u: AdminUser) => void;
}

export function UsersTable({
  loading,
  filtered,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalCount,
  setDeleteTarget,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-[0_2px_12px_rgba(45,42,38,0.04)] overflow-hidden">
      <div className="px-24 py-16 border-b border-border flex flex-wrap gap-12 items-center justify-between">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <svg
            className="absolute left-12 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9.5 pe-12 py-2.5 rounded-lg border border-border text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-8">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-12 py-2.5 rounded-lg border border-border text-sm text-text-primary bg-white outline-none cursor-pointer appearance-none focus:border-primary"
          >
            <option value="All">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="text-xs font-semibold text-text-secondary bg-surface-variant px-12 py-1.25 rounded-full">
            {filtered.length} shown
          </span>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        <table className="w-full border-collapse text-center align-middle min-w-175">
          <thead>
            <tr className="bg-[#faf8f3] border-b border-border text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
              <th className="px-16 py-12 text-left">User</th>
              <th className="px-16 py-12">Roles</th>
              <th className="px-16 py-12">Status</th>
              <th className="px-16 py-12">Joined</th>
              <th className="px-16 py-12 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-24 py-40 text-center text-text-secondary text-sm">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isActive = u.isActive;
                const roles = u.roles || [];
                const isMainAdmin = u.email === 'homepal.system@gmail.com';
                const primaryRole = roles[0] || 'User';

                return (
                  <tr
                    key={u.id}
                    className={cn(
                      'border-b border-[#f4f2ee] hover:bg-surface-variant/30 transition-colors',
                      !isActive && 'opacity-60 grayscale-[0.2]'
                    )}
                  >
                    <td className="px-16 py-16 text-left align-middle">
                      <div className="flex items-center gap-12">
                        <div
                          className={cn(
                            'w-36 h-36 rounded-lg text-13 font-bold flex items-center justify-center shrink-0',
                            roles.includes('Admin')
                              ? 'bg-primary text-white'
                              : 'bg-surface-variant text-text-secondary'
                          )}
                        >
                          {getInitials(u.username)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                            @{u.username || u.fullName}
                            {isMainAdmin && (
                              <span
                                className="bg-primary/10 text-primary text-[10px] px-1 rounded-sm ml-1"
                                title="Root Admin"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-secondary">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-16 py-16 align-middle">
                      <span
                        className={cn(
                          'inline-block whitespace-nowrap text-[11px] font-bold px-10 py-[4px] rounded-full',
                          getRoleBadgeClass(roles)
                        )}
                      >
                        {primaryRole}
                      </span>
                      {roles.length > 1 && (
                        <span className="inline-block whitespace-nowrap text-[10px] text-text-disabled ml-2">
                          +{roles.length - 1}
                        </span>
                      )}
                    </td>

                    <td className="px-16 py-16 align-middle">
                      <div className="flex items-center justify-center gap-6">
                        <span
                          className={cn(
                            'w-[8px] h-[8px] rounded-full shrink-0',
                            isActive ? 'bg-status-success' : 'bg-status-error'
                          )}
                        />
                        <span
                          className={cn(
                            'whitespace-nowrap text-13 font-semibold',
                            isActive ? 'text-status-success' : 'text-status-error'
                          )}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>

                    <td className="px-16 py-16 text-sm text-text-secondary align-middle whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-16 py-16 align-middle">
                      <div className="flex items-center justify-end gap-8">
                        {isActive && !isMainAdmin && (
                          <ActionBtn
                            icon="delete"
                            onClick={() => setDeleteTarget(u)}
                            danger
                            title="Deactivate Access"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-24 py-16 border-t border-border flex flex-wrap gap-12 items-center justify-between">
        <div className="text-xs text-text-secondary font-medium">
          Showing page {page} of {totalPages} (Total: {totalCount})
        </div>
        <div className="flex items-center gap-8">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-8 py-1.5 rounded-lg border border-border text-xs text-text-primary bg-white outline-none cursor-pointer focus:border-primary"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <div className="flex items-center gap-4 bg-surface-variant rounded-lg p-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-12 py-1.5 rounded-md text-xs font-semibold text-text-primary bg-white shadow-sm disabled:opacity-50 disabled:shadow-none disabled:bg-transparent transition-all"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-12 py-1.5 rounded-md text-xs font-semibold text-text-primary bg-white shadow-sm disabled:opacity-50 disabled:shadow-none disabled:bg-transparent transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
