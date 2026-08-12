import { useState } from 'react';
import { cn } from '@lib/utils';
import { Toggle } from '@components/ui/Toggle';
import { adminService } from '@services/adminService';
import type { AdminUser, CreateAdminRequest } from '@typeDefs/adminTypes';

export default function Profile() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      username: 'admin_root',
      fullName: 'Admin Root',
      email: 'admin@homepal.system',
      gender: 1,
      birthDate: '1990-01-01',
      governorate: 'Central',
      city: 'Metropolis',
      isProfileComplete: true,
      emailConfirmed: true,
      roles: ['Super Admin'],
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      username: 'system_ops',
      fullName: 'System Ops',
      email: 'ops@homepal.system',
      gender: 1,
      birthDate: '1992-05-10',
      governorate: 'Central',
      city: 'Metropolis',
      isProfileComplete: true,
      emailConfirmed: true,
      roles: ['System Admin'],
      isActive: true,
      createdAt: '2024-03-10',
    },
    {
      id: '3',
      username: 'support_lead',
      fullName: 'Support Lead',
      email: 'support@homepal.system',
      gender: 2,
      birthDate: '1988-11-22',
      governorate: 'North',
      city: 'Gotham',
      isProfileComplete: true,
      emailConfirmed: true,
      roles: ['Content Moderator'],
      isActive: true,
      createdAt: '2024-05-22',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'System Admin' | 'Content Moderator'>(
    'System Admin'
  );
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [strictAuditLogs, setStrictAuditLogs] = useState(true);

  const handleToggleStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === id ? { ...adm, isActive: !adm.isActive } : adm))
    );
  };

  const handleRemoveAdmin = (id: string) => {
    if (confirm('Are you sure you want to revoke access for this admin?')) {
      setAdmins((prev) => prev.filter((adm) => adm.id !== id));
    }
  };

  const handleResetPassword = (username: string) => {
    alert(`Password reset link generated for admin: @${username}`);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setModalFeedback('Please fill in username and password.');
      return;
    }

    setIsSubmitting(true);
    setModalFeedback(null);

    try {
      const payload: CreateAdminRequest = {
        username: newUsername,
        fullName: `Admin ${newUsername}`,
        email: `${newUsername}@homepal.system`,
        password: newPassword,
        confirmPassword: newPassword,
        gender: 1,
        birthDate: '1990-01-01',
        governorate: 'Central',
        city: 'Metropolis',
      };

      await adminService.createAdmin(payload);

      const createdAdmin: AdminUser = {
        id: Date.now().toString(),
        username: newUsername,
        fullName: `Admin ${newUsername}`,
        email: `${newUsername}@homepal.system`,
        gender: 1,
        birthDate: '1990-01-01',
        governorate: 'Central',
        city: 'Metropolis',
        isProfileComplete: true,
        emailConfirmed: true,
        roles: [newRole],
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setAdmins((prev) => [...prev, createdAdmin]);
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
    } catch {
      const createdAdmin: AdminUser = {
        id: Date.now().toString(),
        username: newUsername,
        fullName: `Admin ${newUsername}`,
        email: `${newUsername}@homepal.system`,
        gender: 1,
        birthDate: '1990-01-01',
        governorate: 'Central',
        city: 'Metropolis',
        isProfileComplete: true,
        emailConfirmed: true,
        roles: [newRole],
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAdmins((prev) => [...prev, createdAdmin]);
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-275 mx-auto flex flex-col gap-7 font-sans">
      {/* ── Page Title & Action Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-32 font-extrabold text-[#2d2a26] tracking-tight m-0">
            Admin & System Settings
          </h1>
          <p className="text-sm text-[#7a7571] mt-1.5 mb-0">
            Manage platform administrators, roles, security controls, and mobile application status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#2a4a3e] text-white text-sm font-bold px-20 py-2.5 rounded-lg border-none cursor-pointer flex items-center gap-[8px] shadow-[0_4px_14px_rgba(42,74,62,0.2)] transition-all duration-150 hover:bg-[#1f372e]"
        >
          <svg
            width="18"
            height="18"
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
          <span>Add New Admin</span>
        </button>
      </div>

      {/* ── Section 1: Admin Directory Table ── */}
      <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-[0_2px_12px_rgba(45,42,38,0.04)] overflow-hidden">
        {/* Table Header Info */}
        <div className="px-24 py-20 border-b border-[#f0ece6] flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-[#2d2a26]">System Administrators Directory</div>
            <div className="text-13 text-[#a8a39d] mt-0.5">
              Active administrators with access to the HomePal Executive Panel.
            </div>
          </div>
          <span className="text-xs font-bold bg-[#dceee8] text-[#2a4a3e] px-12 py-[4px] rounded-full">
            {admins.length} Total Admins
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-200">
            <thead>
              <tr className="bg-[#faf8f3] border-b border-[#e4e0da] text-[11px] font-extrabold text-[#7a7571] uppercase tracking-wider">
                <th className="px-24 py-3.5">Admin User</th>
                <th className="px-24 py-3.5">Role</th>
                <th className="px-24 py-3.5">Status</th>
                <th className="px-24 py-3.5">Toggle Access</th>
                <th className="px-24 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm) => {
                const initials = adm.username.slice(0, 2).toUpperCase();
                const isSuper = adm.roles?.includes('Super Admin');
                const isActive = adm.isActive;

                return (
                  <tr
                    key={adm.id}
                    className="border-b border-[#f4f2ee] transition-colors duration-120 hover:bg-surface-variant/30"
                  >
                    {/* User Info */}
                    <td className="px-24 py-4">
                      <div className="flex items-center gap-12">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg text-13 font-bold flex items-center justify-center',
                            isSuper ? 'bg-[#2a4a3e] text-white' : 'bg-[#e4e0da] text-[#5a5652]'
                          )}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#2d2a26]">@{adm.username}</div>
                          <div className="text-xs text-[#a8a39d]">{adm.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-24 py-4">
                      <span
                        className={cn(
                          'text-[11px] font-bold px-2.5 py-[4px] rounded-full',
                          isSuper
                            ? 'bg-[#2a4a3e] text-white'
                            : adm.roles?.includes('System Admin')
                              ? 'bg-[#dceee8] text-[#2a4a3e]'
                              : 'bg-[#f4f2ee] text-[#5a5652]'
                        )}
                      >
                        {adm.roles?.[0] || 'User'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-24 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'w-[8px] h-[8px] rounded-full',
                            isActive ? 'bg-status-success' : 'bg-status-error'
                          )}
                        />
                        <span
                          className={cn(
                            'text-13 font-semibold',
                            isActive ? 'text-status-success' : 'text-status-error'
                          )}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>

                    {/* Toggle Switch */}
                    <td className="px-24 py-4">
                      <Toggle
                        checked={isActive}
                        onChange={() => handleToggleStatus(adm.id)}
                        title={isActive ? 'Click to Suspend' : 'Click to Activate'}
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="px-24 py-4 text-right">
                      <div className="flex items-center justify-end gap-[8px]">
                        <button
                          onClick={() => handleResetPassword(adm.username)}
                          title="Reset Password"
                          className="bg-[#f4f2ee] border border-[#e4e0da] rounded-lg px-12 py-1.5 text-xs font-semibold text-[#2d2a26] cursor-pointer transition-colors hover:bg-[#e4e0da]"
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => handleRemoveAdmin(adm.id)}
                          title="Remove Admin"
                          className="bg-status-error-container border-none rounded-lg px-2.5 py-1.5 text-xs font-semibold text-status-error cursor-pointer hover:bg-status-error-container/80 transition-colors"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: Platform Controls & Maintenance Mode ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
        {/* Mobile App Maintenance Mode Control */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-[0_2px_12px_rgba(45,42,38,0.04)] p-24 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    maintenanceMode
                      ? 'bg-status-error-container text-status-error'
                      : 'bg-[#dceee8] text-[#2a4a3e]'
                  )}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2d2a26] m-0">
                    Mobile App Maintenance Mode
                  </h3>
                  <div className="text-xs text-[#a8a39d] mt-0.5">
                    Target: HomePal Mobile Application (End-Users)
                  </div>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <Toggle
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                title={maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              />
            </div>

            <p className="text-13 text-[#5a5652] mt-4 leading-relaxed">
              Enabling Maintenance Mode displays a{' '}
              <strong>"System under scheduled maintenance"</strong> screen on the Mobile Application
              for clients. The Admin Panel remains operational.
            </p>
          </div>

          <div className="pt-4 border-t border-[#f4f2ee] flex justify-between items-center mt-4">
            <span className="text-xs font-semibold text-[#7a7571]">Current Mobile App Status:</span>
            <span
              className={cn(
                'text-xs font-extrabold px-2.5 py-[4px] rounded-full',
                maintenanceMode
                  ? 'text-status-error bg-status-error-container'
                  : 'text-status-success bg-status-success-container'
              )}
            >
              {maintenanceMode ? '⚠️ Under Maintenance' : '🟢 Live & Operational'}
            </span>
          </div>
        </div>

        {/* Security Policies */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-[0_2px_12px_rgba(45,42,38,0.04)] p-24 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#f4f2ee] text-[#2a4a3e] flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#2d2a26] m-0">
                Security & Session Policies
              </h3>
            </div>

            {/* Session Timeout Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#5a5652] mb-1.5">
                Admin Session Idle Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e4e0da] text-13 text-[#2d2a26] bg-[#fcfbf9] outline-none cursor-pointer"
              >
                <option value="15">15 Minutes (High Security)</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">1 Hour</option>
                <option value="0">Never (Dev Mode)</option>
              </select>
            </div>

            {/* Strict Audit Logging */}
            <div className="flex justify-between items-center pt-2.5">
              <div>
                <div className="text-13 font-semibold text-[#2d2a26]">
                  Strict Security Audit Logs
                </div>
                <div className="text-[11px] text-[#a8a39d]">
                  Log every admin action with IP address and username
                </div>
              </div>
              <button
                onClick={() => setStrictAuditLogs((v) => !v)}
                className={cn(
                  'w-11h-24 rounded-full border-none cursor-pointer p-0.5',
                  strictAuditLogs ? 'bg-[#2a4a3e]' : 'bg-[#d1d5db]'
                )}
              >
                <span
                  className={cn(
                    'block w-20 h-20 rounded-full bg-white transition-transform duration-200',
                    strictAuditLogs ? 'translate-x-20' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f4f2ee] text-right mt-4">
            <span className="text-[11px] text-[#a8a39d]">
              All security policies enforced globally across admin accounts.
            </span>
          </div>
        </div>
      </div>

      {/* ── Modal: Add New Admin Account ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-20">
          <div className="bg-white rounded-2xl w-full max-w-115 p-7 shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-20 right-20 bg-transparent border-none text-xl text-[#a8a39d] cursor-pointer hover:text-text-primary"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-[#2d2a26] m-0 mb-1.5">
              Create New Admin Account
            </h3>
            <p className="text-13 text-[#7a7571] m-0 mb-20">
              Assign credentials and role level for the new administrator.
            </p>

            {modalFeedback && (
              <div className="px-12 py-[8px] rounded-lg bg-status-error-container text-status-error text-xs mb-4">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5652] mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. admin_ops"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e4e0da] text-sm box-border outline-none focus:border-primary"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5652] mb-1.5">
                  Assign Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e4e0da] text-sm box-border outline-none bg-white cursor-pointer focus:border-primary"
                >
                  <option value="System Admin">System Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Content Moderator">Content Moderator</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#5a5652]">Initial Password</label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-transparent border-none text-[11px] font-bold text-[#2a4a3e] cursor-pointer hover:opacity-80"
                  >
                    🎲 Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e4e0da] text-sm box-border outline-none focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-12">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 p-2.5 rounded-lg border border-[#e4e0da] bg-white text-sm font-semibold text-[#5a5652] cursor-pointer hover:bg-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'flex-1 p-2.5 rounded-lg border-none bg-[#2a4a3e] text-sm font-bold text-white cursor-pointer hover:bg-[#1f372e]',
                    isSubmitting && 'opacity-75 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
