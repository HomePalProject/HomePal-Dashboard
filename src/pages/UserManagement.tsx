import { useState } from 'react';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { AdminFormModal } from '@components/users/AdminFormModal';
import { UsersMetrics } from '@components/users/UsersMetrics';
import { UsersTable } from '@components/users/UsersTable';
import {
  useAdmins,
  useGlobalAdminsCount,
  useDeactivateAdmin,
  useCreateAdmin,
} from '@hooks/useUserManagement';
import { getErrorMessage } from '@lib/utils';
import type { AdminUser, CreateAdminRequest } from '@typeDefs/adminTypes';

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const {
    data: usersResponse,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useAdmins(page, pageSize);
  const { data: globalTotalAdmins = 0 } = useGlobalAdminsCount();

  const { mutateAsync: deactivateAdmin, isPending: isDeleting } = useDeactivateAdmin();
  const { mutateAsync: createAdmin } = useCreateAdmin();

  const users: AdminUser[] = usersResponse?.data?.items || [];
  const totalPages = usersResponse?.data?.totalPages || 1;
  const totalCount = usersResponse?.data?.totalCount || 0;

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || (u.roles || []).includes(roleFilter);
    return matchSearch && matchRole;
  });

  const totalActive = users.filter((u) => u.isActive).length;
  const totalSuspended = users.length - totalActive;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deactivateAdmin(deleteTarget.id);
      if (!res.success) {
        alert(res.message || 'Failed to deactivate user.');
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
        return res.message || 'Failed to create user.';
      }
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-error-container text-status-error p-20 rounded-xl">
        <h3 className="font-bold mb-8 m-0">Failed to load</h3>
        <p className="m-0 text-sm">{getErrorMessage(queryError)}</p>
        <button
          onClick={() => refetch()}
          className="mt-12 px-16 py-8 bg-white border border-status-error/20 rounded-lg text-sm text-status-error cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-wrap items-start justify-between gap-16">
        <div>
          <h1 className="text-32 font-extrabold text-text-primary tracking-tight m-0">
            User Management
          </h1>
          <p className="text-sm text-text-secondary mt-4 mb-0">
            Manage all users, including admins, household admins, and members.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-8 bg-primary text-white text-sm font-bold px-20 py-2.5 rounded-lg border-none cursor-pointer shadow-[0_4px_14px_rgba(42,74,62,0.25)] hover:opacity-90 transition-opacity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Admin
        </button>
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
          message={`Are you sure you want to deactivate access for @${deleteTarget.username || deleteTarget.fullName}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
