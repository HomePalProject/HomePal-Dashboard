import { Button } from '@components/ui/Button';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { AdminFormModal } from '@components/users/AdminFormModal';
import { UsersMetrics } from '@components/users/UsersMetrics';
import { UsersTable } from '@components/users/UsersTable';
import {
  useAdmins,
  useCreateAdmin,
  useDeactivateAdmin,
  useGlobalAdminsCount,
} from '@hooks/useUserManagement';
import { getErrorMessage } from '@lib/utils';
import type { AdminUser, CreateAdminRequest } from '@typeDefs/adminTypes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation(['users', 'common']);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: usersResponse,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useAdmins(
    page,
    pageSize,
    roleFilter !== 'All' ? roleFilter : undefined,
    debouncedSearch || undefined
  );
  const { data: globalTotalAdmins = 0 } = useGlobalAdminsCount();

  const { mutateAsync: deactivateAdmin, isPending: isDeleting } = useDeactivateAdmin();
  const { mutateAsync: createAdmin } = useCreateAdmin();

  const users: AdminUser[] = usersResponse?.data?.items || [];
  const totalPages = usersResponse?.data?.totalPages || 1;
  const totalCount = usersResponse?.data?.totalCount || 0;

  // We rely on backend filtering now, so filtered is just users.
  const filtered = users;

  const totalActive = users.filter((u) => u.isActive).length;
  const totalSuspended = users.length - totalActive;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deactivateAdmin(deleteTarget.id);
      if (!res.success) {
        alert(res.message || t('deactivateFailed', 'Failed to deactivate user.'));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreateAdmin = async (data: CreateAdminRequest): Promise<string | null> => {
    try {
      const res = await createAdmin(data);
      if (res.success) {
        setPage(1);
        setShowAddModal(false);
        return null;
      } else {
        return res.message || t('createFailed', 'Failed to create user.');
      }
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-semibold text-text-secondary">{t('loadingDirectory')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-error-container/60 border border-status-error/20 text-status-error p-6 rounded-xl max-w-xl mx-auto my-10 text-center shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-status-error/10 text-status-error flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-sm font-bold m-0 mb-1">{t('failedLoad')}</h3>
        <p className="m-0 text-xs text-text-secondary">{getErrorMessage(queryError)}</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="mt-4 text-status-error border-status-error/30 hover:bg-status-error/10"
        >
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-1.5 border border-primary/20">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {t('accessControl')}
          </div> */}
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight m-0">
            {t('title')}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5 mb-0">{t('subtitle')}</p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="md"
          className="gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('addNewAdmin')}
        </Button>
      </div>

      <UsersMetrics
        totalCount={totalCount}
        totalActive={totalActive}
        totalSuspended={totalSuspended}
        globalTotalAdmins={globalTotalAdmins}
      />

      <UsersTable
        loading={isLoading || isDeleting}
        filtered={filtered}
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        totalCount={totalCount}
        setDeleteTarget={setDeleteTarget}
      />

      {showAddModal && (
        <AdminFormModal onSave={handleCreateAdmin} onClose={() => setShowAddModal(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t('deactivateTitle')}
          confirmLabel={t('deactivateConfirm')}
          message={t('deactivateMessage', { name: deleteTarget.username || deleteTarget.fullName })}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
