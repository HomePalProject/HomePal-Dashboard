import { useState } from 'react';
import { cn } from '@lib/utils';
import { getImageUrl } from '@lib/formatters';
import { Button } from '@components/ui/Button';
import { ROLE_OPTIONS, getRoleBadgeClass, getInitials } from '@/utils/userUtils';
import type { AdminUser } from '@typeDefs/adminTypes';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('users');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('All');
  };

  return (
    <div className="bg-surface rounded-xl border border-border/80 shadow-2xs overflow-hidden transition-all">
      {/* Toolbar Section */}
      <div className="p-3.5 border-b border-border/70 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-surface-variant/15">
        {/* Search Bar - Generous and natural width */}
        <div className="relative w-full sm:w-80 md:w-96">
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-border text-xs text-text-primary bg-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-disabled"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary p-0.5 rounded transition-colors cursor-pointer"
              title={t('clearSearch')}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters and count */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-variant/40 p-1 rounded-lg border border-border/60 overflow-x-auto scrollbar-none max-w-full shrink-0">
            <button
              onClick={() => setRoleFilter('All')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                roleFilter === 'All'
                  ? 'bg-surface text-primary shadow-2xs font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {t('all')}
            </button>
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                  roleFilter === r
                    ? 'bg-surface text-primary shadow-2xs font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {t('role_' + r.toLowerCase().replace(/\s+/g, '_'), r)}
              </button>
            ))}
          </div>

          <span className="text-xs text-text-secondary bg-surface border border-border/60 px-2.5 py-1 rounded-lg shadow-2xs">
            <span className="text-primary font-bold">{filtered.length}</span> / {totalCount}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto relative min-h-60">
        {loading && (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border shadow-md">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs font-medium text-text-secondary">
                {t('loadingDirectory')}
              </span>
            </div>
          </div>
        )}

        <table className="w-full border-collapse text-left align-middle text-xs">
          <thead>
            <tr className="bg-surface-variant/20 border-b border-border/70 text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              <th className="px-3.5 py-2.5 whitespace-nowrap">{t('thUser')}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{t('thRole')}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{t('thStatus')}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{t('thJoined')}</th>
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">{t('thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                    <div className="w-8 h-8 rounded-full bg-surface-variant/50 border border-border flex items-center justify-center text-text-disabled">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-primary">
                        {t('noMatchingUsers')}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5 mb-0">
                        {search || roleFilter !== 'All'
                          ? t('noMatchingUsersDesc')
                          : t('noUsersRecorded')}
                      </p>
                    </div>
                    {(search || roleFilter !== 'All') && (
                      <button
                        onClick={clearFilters}
                        className="mt-1 px-3 py-1 bg-surface border border-border text-xs font-semibold text-primary rounded-lg hover:bg-surface-variant/40 transition-colors cursor-pointer shadow-2xs"
                      >
                        {t('resetFilters')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isActive = u.isActive;
                const roles = u.roles || [];
                const isMainAdmin = u.email === 'homepal.system@gmail.com';
                const primaryRole = roles[0] || 'User';
                const avatarUrl = getImageUrl(u.profileImageUrl);

                return (
                  <tr
                    key={u.id}
                    className={cn(
                      'group hover:bg-surface-variant/20 transition-colors',
                      !isActive && 'bg-status-error/5 opacity-75'
                    )}
                  >
                    {/* User Identity Cell */}
                    <td className="px-3.5 py-2.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="shrink-0">
                          {avatarUrl && !imgErrors[u.id] ? (
                            <img
                              src={avatarUrl}
                              alt={u.username}
                              onError={() => setImgErrors((prev) => ({ ...prev, [u.id]: true }))}
                              className="w-12 h-12 rounded-full object-cover shadow-2xs border-2 border-border/60"
                            />
                          ) : (
                            <div
                              className={cn(
                                'w-12 h-12 rounded-full text-base font-bold flex items-center justify-center shadow-2xs',
                                isMainAdmin
                                  ? 'bg-amber-600 text-white border-2 border-amber-700/20'
                                  : roles.includes('Admin')
                                    ? 'bg-[#356859] text-white border-2 border-[#2a5347]/20'
                                    : 'bg-surface-variant text-text-primary border-2 border-border/60'
                              )}
                            >
                              {getInitials(u.username)}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="text-xs font-bold text-text-primary flex items-center gap-1.5 truncate">
                            <span>@{u.username || u.fullName}</span>
                            {isMainAdmin && (
                              <span
                                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded"
                                title="Root Admin"
                              >
                                ★ Root
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-text-secondary group/email">
                            <span className="truncate max-w-[140px] sm:max-w-xs">{u.email}</span>
                            <button
                              onClick={() => handleCopyEmail(u.email)}
                              className="opacity-0 group-hover/email:opacity-100 text-text-disabled hover:text-primary transition-opacity p-0.5 cursor-pointer"
                              title={t('copyEmail')}
                            >
                              {copiedEmail === u.email ? (
                                <span className="text-[9px] font-bold text-status-success">✓</span>
                              ) : (
                                <svg
                                  className="w-2.5 h-2.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge Cell */}
                    <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <span
                          className={cn(
                            'text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                            getRoleBadgeClass(roles)
                          )}
                        >
                          {t('role_' + primaryRole.toLowerCase().replace(/\s+/g, '_'), primaryRole)}
                        </span>
                        {roles.length > 1 && (
                          <span className="text-[9px] font-medium text-text-disabled">
                            {t('moreRoles', { count: roles.length - 1 })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Account Status Cell */}
                    <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-surface border border-border/60 px-2 py-0.5 rounded-full shadow-2xs">
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isActive ? 'bg-status-success' : 'bg-status-error'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[11px] font-semibold',
                            isActive ? 'text-status-success' : 'text-status-error'
                          )}
                        >
                          {isActive ? t('statusActive') : t('statusSuspended')}
                        </span>
                      </div>
                    </td>

                    {/* Registration Date Cell */}
                    <td className="px-3 py-2.5 text-center text-xs text-text-secondary align-middle whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions Cell */}
                    <td className="px-3.5 py-2.5 text-right align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isActive && !isMainAdmin ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t('deactivateTitle')}
                            onClick={() => setDeleteTarget(u)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </Button>
                        ) : isMainAdmin ? (
                          <span className="text-[10px] text-text-disabled italic px-1.5 py-0.5 bg-surface-variant/40 rounded">
                            {t('roleProtected')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-status-error/80 italic px-1.5 py-0.5 bg-status-error/10 rounded">
                            {t('statusSuspended')}
                          </span>
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

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border/70 flex flex-wrap gap-2.5 items-center justify-between bg-surface-variant/15 text-xs">
        <div className="text-text-secondary">{t('pageOf', { page, totalPages, totalCount })}</div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary text-[11px]">{t('rows')}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-md border border-border text-xs text-text-primary bg-surface outline-none cursor-pointer focus:border-primary shadow-2xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-border/60 shadow-2xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded text-xs font-semibold text-text-primary bg-surface hover:bg-surface-variant/40 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {t('prev')}
            </button>
            <span className="px-1.5 text-xs font-bold text-primary">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded text-xs font-semibold text-text-primary bg-surface hover:bg-surface-variant/40 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
