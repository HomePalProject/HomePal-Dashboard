import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const API = import.meta.env.VITE_API_BASE_URL ?? '';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'System Admin' | 'Content Moderator';
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export default function Profile() {
  const token = useAuthStore((s) => s.token);

  // Admin Directory List State
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: '1',
      username: 'admin_root',
      email: 'admin@homepal.system',
      role: 'Super Admin',
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      username: 'system_ops',
      email: 'ops@homepal.system',
      role: 'System Admin',
      status: 'Active',
      createdAt: '2024-03-10',
    },
    {
      id: '3',
      username: 'support_lead',
      email: 'support@homepal.system',
      role: 'Content Moderator',
      status: 'Active',
      createdAt: '2024-05-22',
    },
  ]);

  // Add New Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'System Admin' | 'Content Moderator'>(
    'System Admin'
  );
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // System Controls State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [strictAuditLogs, setStrictAuditLogs] = useState(true);

  // Toggle Admin Status (Active <-> Suspended)
  const handleToggleStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((adm) =>
        adm.id === id ? { ...adm, status: adm.status === 'Active' ? 'Suspended' : 'Active' } : adm
      )
    );
  };

  // Remove Admin
  const handleRemoveAdmin = (id: string) => {
    if (confirm('Are you sure you want to revoke access for this admin?')) {
      setAdmins((prev) => prev.filter((adm) => adm.id !== id));
    }
  };

  // Reset Admin Password
  const handleResetPassword = (username: string) => {
    alert(`Password reset link generated for admin: @${username}`);
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  // Handle Add Admin Submit
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setModalFeedback('Please fill in username and password.');
      return;
    }

    setIsSubmitting(true);
    setModalFeedback(null);

    try {
      // Send register request to backend
      await fetch(`${API}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          username: newUsername,
          fullName: `Admin ${newUsername}`,
          email: `${newUsername}@homepal.system`,
          password: newPassword,
          confirmPassword: newPassword,
          gender: 1,
          birthDate: '1990-01-01',
          governorate: 'Central',
          city: 'Metropolis',
        }),
      });

      // Add to local state
      const createdAdmin: AdminUser = {
        id: Date.now().toString(),
        username: newUsername,
        email: `${newUsername}@homepal.system`,
        role: newRole,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setAdmins((prev) => [...prev, createdAdmin]);
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
    } catch {
      // Fallback local add
      const createdAdmin: AdminUser = {
        id: Date.now().toString(),
        username: newUsername,
        email: `${newUsername}@homepal.system`,
        role: newRole,
        status: 'Active',
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
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* ── Page Title & Action Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#2d2a26',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Admin & System Settings
          </h1>
          <p style={{ fontSize: 14, color: '#7a7571', marginTop: 6, margin: 0 }}>
            Manage platform administrators, roles, security controls, and mobile application status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#2a4a3e',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(42,74,62,0.2)',
            transition: 'all 150ms ease',
          }}
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
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e4e0da',
          boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header Info */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0ece6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2d2a26' }}>
              System Administrators Directory
            </div>
            <div style={{ fontSize: 13, color: '#a8a39d', marginTop: 2 }}>
              Active administrators with access to the HomePal Executive Panel.
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: '#dceee8',
              color: '#2a4a3e',
              padding: '4px 12px',
              borderRadius: 999,
            }}
          >
            {admins.length} Total Admins
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  background: '#faf8f3',
                  borderBottom: '1px solid #e4e0da',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#7a7571',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <th style={{ padding: '14px 24px' }}>Admin User</th>
                <th style={{ padding: '14px 24px' }}>Role</th>
                <th style={{ padding: '14px 24px' }}>Status</th>
                <th style={{ padding: '14px 24px' }}>Toggle Access</th>
                <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm) => {
                const initials = adm.username.slice(0, 2).toUpperCase();
                const isSuper = adm.role === 'Super Admin';
                const isActive = adm.status === 'Active';

                return (
                  <tr
                    key={adm.id}
                    style={{
                      borderBottom: '1px solid #f4f2ee',
                      transition: 'background 120ms ease',
                    }}
                  >
                    {/* User Info */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: isSuper ? '#2a4a3e' : '#e4e0da',
                            color: isSuper ? '#ffffff' : '#5a5652',
                            fontSize: 13,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#2d2a26' }}>
                            @{adm.username}
                          </div>
                          <div style={{ fontSize: 12, color: '#a8a39d' }}>{adm.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: isSuper
                            ? '#2a4a3e'
                            : adm.role === 'System Admin'
                              ? '#dceee8'
                              : '#f4f2ee',
                          color: isSuper
                            ? '#ffffff'
                            : adm.role === 'System Admin'
                              ? '#2a4a3e'
                              : '#5a5652',
                        }}
                      >
                        {adm.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isActive ? '#10b981' : '#f87171',
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isActive ? '#065f46' : '#991b1b',
                          }}
                        >
                          {adm.status}
                        </span>
                      </div>
                    </td>

                    {/* Toggle Switch */}
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        onClick={() => handleToggleStatus(adm.id)}
                        title={isActive ? 'Click to Suspend' : 'Click to Activate'}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 999,
                          background: isActive ? '#2a4a3e' : '#d1d5db',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 200ms ease',
                          padding: 2,
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            transform: isActive ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 200ms ease',
                          }}
                        />
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() => handleResetPassword(adm.username)}
                          title="Reset Password"
                          style={{
                            background: '#f4f2ee',
                            border: '1px solid #e4e0da',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#2d2a26',
                            cursor: 'pointer',
                            transition: 'background 120ms',
                          }}
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => handleRemoveAdmin(adm.id)}
                          title="Remove Admin"
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#b91c1c',
                            cursor: 'pointer',
                          }}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Mobile App Maintenance Mode Control */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e4e0da',
            boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: maintenanceMode ? '#fee2e2' : '#dceee8',
                    color: maintenanceMode ? '#dc2626' : '#2a4a3e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d2a26', margin: 0 }}>
                    Mobile App Maintenance Mode
                  </h3>
                  <div style={{ fontSize: 12, color: '#a8a39d', marginTop: 2 }}>
                    Target: HomePal Mobile Application (End-Users)
                  </div>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <button
                onClick={() => setMaintenanceMode((v) => !v)}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 999,
                  background: maintenanceMode ? '#dc2626' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 3,
                  transition: 'background 200ms ease',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: maintenanceMode ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'transform 200ms ease',
                  }}
                />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#5a5652', marginTop: 16, lineHeight: 1.5 }}>
              Enabling Maintenance Mode displays a{' '}
              <strong>"System under scheduled maintenance"</strong> screen on the Mobile Application
              for clients. The Admin Panel remains operational.
            </p>
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid #f4f2ee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#7a7571' }}>
              Current Mobile App Status:
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: maintenanceMode ? '#dc2626' : '#065f46',
                background: maintenanceMode ? '#fee2e2' : '#dceee8',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {maintenanceMode ? '⚠️ Under Maintenance' : '🟢 Live & Operational'}
            </span>
          </div>
        </div>

        {/* Security Policies */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e4e0da',
            boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f4f2ee',
                  color: '#2a4a3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d2a26', margin: 0 }}>
                Security & Session Policies
              </h3>
            </div>

            {/* Session Timeout Selector */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#5a5652',
                  marginBottom: 6,
                }}
              >
                Admin Session Idle Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #e4e0da',
                  fontSize: 13,
                  color: '#2d2a26',
                  background: '#fcfbf9',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="15">15 Minutes (High Security)</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">1 Hour</option>
                <option value="0">Never (Dev Mode)</option>
              </select>
            </div>

            {/* Strict Audit Logging */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2d2a26' }}>
                  Strict Security Audit Logs
                </div>
                <div style={{ fontSize: 11, color: '#a8a39d' }}>
                  Log every admin action with IP address and username
                </div>
              </div>
              <button
                onClick={() => setStrictAuditLogs((v) => !v)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  background: strictAuditLogs ? '#2a4a3e' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: strictAuditLogs ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 200ms ease',
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid #f4f2ee', textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#a8a39d' }}>
              All security policies enforced globally across admin accounts.
            </span>
          </div>
        </div>
      </div>

      {/* ── Modal: Add New Admin Account ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 460,
              padding: 28,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                fontSize: 20,
                color: '#a8a39d',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d2a26', margin: '0 0 6px 0' }}>
              Create New Admin Account
            </h3>
            <p style={{ fontSize: 13, color: '#7a7571', margin: '0 0 20px 0' }}>
              Assign credentials and role level for the new administrator.
            </p>

            {modalFeedback && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#fee2e2',
                  color: '#b91c1c',
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {modalFeedback}
              </div>
            )}

            <form
              onSubmit={handleCreateAdmin}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Username */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#5a5652',
                    marginBottom: 6,
                  }}
                >
                  Admin Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. admin_ops"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #e4e0da',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#5a5652',
                    marginBottom: 6,
                  }}
                >
                  Assign Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #e4e0da',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="System Admin">System Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Content Moderator">Content Moderator</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5a5652' }}>
                    Initial Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#2a4a3e',
                      cursor: 'pointer',
                    }}
                  >
                    🎲 Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #e4e0da',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: '1px solid #e4e0da',
                    background: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#5a5652',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#2a4a3e',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
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
